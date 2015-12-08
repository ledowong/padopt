var TYPES = 7;
var ORB_X_SEP = 64;
var ORB_Y_SEP = 64;
var ORB_WIDTH = 60;
var ORB_HEIGHT = 60;
var MULTI_ORB_BONUS = 0.25;
var COMBO_BONUS = 0.25;
var MAX_SOLUTIONS_COUNT = ROWS * COLS * $('#num-paths').val();
//var MAX_SOLUTIONS_COUNT = ROWS * COLS * 2 * 8;
var globalmult = -1;

function make_rc(row, col) {
    return {row: row, col: col};
}


function make_match(type, count, isRow) {
    return {type: type, count: count, isRow: isRow};
}

/*
function make_match(type, count) {
    return {type: type, count: count};
}
*/

function to_xy(rc) {
    var x = rc.col * ORB_X_SEP + ORB_WIDTH/2;
    var y = rc.row * ORB_Y_SEP + ORB_HEIGHT/2;
    return {x: x, y: y};
}

function copy_rc(rc) {
    return {row: rc.row, col: rc.col};
}

function equals_xy(a, b) {
    return a.x == b.x && a.y == b.y;
}

function equals_rc(a, b) {
    return a.row == b.row && a.col == b.col;
}

function create_empty_board() {
    var result = new Array(ROWS);
    for (var i = 0; i < ROWS; ++ i) {
        result[i] = new Array(COLS);
    }
    return result;
}

function get_board() {
    var result = create_empty_board();
    $('[id^="grid"] > div').each(function() {
        var row = this.id.charAt(1);
        var col = this.id.charAt(2);
        var type = get_type(this);
        result[row][col] = type;
    });
    return result;
}

function copy_board(board) {
    return board.map(function(a) { return a.slice(); });
}

function get_type(elem) {
    return elem.className.match(/e([\dX])/)[1];
}

function advance_type(type, dt) {
    if (type == 'X') {
        return dt == 1 ? '0' : '6';
    } else {
        var new_type = dt + +type;
        if (new_type < 0) {
            new_type += TYPES;
        } else if (new_type >= TYPES) {
            new_type -= TYPES;
        }
        return new_type;
    }
}

function get_weights() {
    var weights = new Array(TYPES);
    for (var i = 0; i < TYPES; ++ i) {
        weights[i] = {
            normal: +$('#e' + i + '-normal').val(),
            mass: +$('#e' + i + '-mass').val(),
			row: +$('#e' + i + '-row').val(),
			tpa: +$('#e' + i + '-tpa').val()
        };
    }
    return weights;
}

function find_matches(board) {
    var match_board = create_empty_board();

    // 1. filter all 3+ consecutives.
    //  (a) horizontals
    for (var i = 0; i < ROWS; ++ i) {
        var prev_1_orb = 'X';
        var prev_2_orb = 'X';
        for (var j = 0; j < COLS; ++ j) {
            var cur_orb = board[i][j];
            if (prev_1_orb == prev_2_orb && prev_2_orb == cur_orb && cur_orb != 'X') {
                match_board[i][j] = cur_orb;
                match_board[i][j-1] = cur_orb;
                match_board[i][j-2] = cur_orb;
            }
            prev_1_orb = prev_2_orb;
            prev_2_orb = cur_orb;
        }
    }
    //  (b) verticals
    for (var j = 0; j < COLS; ++ j) {
        var prev_1_orb = 'X';
        var prev_2_orb = 'X';
        for (var i = 0; i < ROWS; ++ i) {
            var cur_orb = board[i][j];
            if (prev_1_orb == prev_2_orb && prev_2_orb == cur_orb && cur_orb != 'X') {
                match_board[i][j] = cur_orb;
                match_board[i-1][j] = cur_orb;
                match_board[i-2][j] = cur_orb;
            }
            prev_1_orb = prev_2_orb;
            prev_2_orb = cur_orb;
        }
    }

    var scratch_board = copy_board(match_board);

    // 2. enumerate the matches by flood-fill.
    var matches = [];
    if (ROWS == "4") {
	var thisMatch = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    } else if (ROWS == "5") {
	var thisMatch = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
    } else if (ROWS == "6") {
	var thisMatch = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
    }
    for (var i = 0; i < ROWS; ++ i) {
        for (var j = 0; j < COLS; ++ j) {
            var cur_orb = scratch_board[i][j];
            if (typeof(cur_orb) == 'undefined') { continue; }
            var stack = [make_rc(i, j)];
            var count = 0;
            if (ROWS == "4") {
	        var thisMatch = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
            } else if (ROWS == "5") {
                var thisMatch = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
            } else if (ROWS == "6") {
                var thisMatch = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];      
            }
            while (stack.length) {
                var n = stack.pop();
                if (scratch_board[n.row][n.col] != cur_orb) { continue; }
                ++ count;
                scratch_board[n.row][n.col] = undefined;
				thisMatch[n.row][n.col] = 1;
                if (n.row > 0) { stack.push(make_rc(n.row-1, n.col)); }
                if (n.row < ROWS-1) { stack.push(make_rc(n.row+1, n.col)); }
                if (n.col > 0) { stack.push(make_rc(n.row, n.col-1)); }
                if (n.col < COLS-1) { stack.push(make_rc(n.row, n.col+1)); }
            }
			var isRow = false;
			for(var k = 0; k < ROWS; ++k)
			{
			if (ROWS == "4") {
				if(thisMatch[k][0] == 1 && thisMatch[k][1] == 1 && thisMatch[k][2] == 1 && thisMatch[k][3] == 1)
				{
					isRow = true;
				}			
			} else if (ROWS == "5") {
				if(thisMatch[k][0] == 1 && thisMatch[k][1] == 1 && thisMatch[k][2] == 1 && thisMatch[k][3] == 1 && thisMatch[k][4] == 1)
				{
					isRow = true;
				}			
			} else if (ROWS == "6") {
				if(thisMatch[k][0] == 1 && thisMatch[k][1] == 1 && thisMatch[k][2] == 1 && thisMatch[k][3] == 1 && thisMatch[k][4] == 1 && thisMatch[k][5] == 1)
				{
					isRow = true;
				}
			}
			}
            matches.push(make_match(cur_orb, count, isRow));


			//matches.push(make_match(cur_orb, count));
        }
    }

    return {matches: matches, board: match_board};
}

function equals_matches(a, b) {
    if (a.length != b.length) {
        return false;
    }
    return a.every(function(am, i) {
        var bm = b[i];
        return am.type == bm.type && am.count == bm.count;
    });
}

function compute_weight(matches, weights) {
    var total_weight = 0;
	//find num rows.
	var numRows = [0,0,0,0,0,0,0];
	matches.forEach(function(m)
	{
		if(m.isRow)
		{
			numRows[m.type]++;
		}
	});
    matches.forEach(function(m) {
        var base_weight = weights[m.type][m.count >= 5 ? 'mass' : 'normal'];

		//TPA
		if(m.count == 4)
		{
			base_weight += weights[m.type]['tpa'];
		}

        var multi_orb_bonus = (m.count - 3) * MULTI_ORB_BONUS + 1;

		total_weight += multi_orb_bonus * base_weight * (1 + numRows[m.type]*weights[m.type]['row']/10);
		//total_weight += multi_orb_bonus * base_weight;
    });
    var combo_bonus = (matches.length - 1) * COMBO_BONUS + 1;
    return total_weight * combo_bonus;
}

function compute_mult(paramBoard)
{
	board = copy_board(paramBoard)

	var all_matches = [];
    while (true) {
        var matches = find_matches(board);
        if (matches.matches.length == 0) {
            break;
        }
        in_place_remove_matches(board, matches.board);
        in_place_drop_empty_spaces(board);
        all_matches = all_matches.concat(matches.matches);
    }

	if(globalmult == 0)//umiyama
	{
		var blue = 0;
		var green = 0;
		var yellow = 0;
		var purple = 0;
		all_matches.forEach(function(m) {
			if(m.type == 1) {blue = 1;}
			if(m.type == 2) {green = 1;}
			if(m.type == 3) {yellow = 1;}
			if(m.type == 4) {purple = 1;}
		});

		return 6*(blue+green+yellow+purple) + 1;
	}

	if(globalmult == 1)//kirin
	{
		var red = 0;
		var blue = 0;
		var green = 0;
		var yellow = 0;

		all_matches.forEach(function(m) {
			if(m.type == 0) {red = 1;}
			if(m.type == 1) {blue = 1;}
			if(m.type == 2) {green = 1;}
			if(m.type == 3) {yellow = 1;}

		});

		return 6*(blue+green+yellow+red) + 1;
	}

	if(globalmult == 2)//ra
	{
		var red = 0;
		var blue = 0;
		var green = 0;
		var yellow = 0;
		var purple = 0;
		all_matches.forEach(function(m) {
			if(m.type == 0) {red = 1;}
			if(m.type == 1) {blue = 1;}
			if(m.type == 2) {green = 1;}
			if(m.type == 3) {yellow = 1;}
			if(m.type == 4) {purple = 1;}
		});

		return (7*(blue+green+yellow+red+purple) + 1);
	}

	if(globalmult == 3)//kush
	{
		if(all_matches.length >= 3)
		{
			return (all_matches.length/2)*(all_matches.length/2);
		}
	}

	if(globalmult == 4)//haku
	{
		var red = 0;
		var blue = 0;
		var purple = 0;

		all_matches.forEach(function(m) {
			if(m.type == 0) {red = 1;}
			if(m.type == 1) {blue = 1;}
			if(m.type == 4) {purple = 1;}
		});
		return 3.75*(blue+purple+red) + 1;
	}

	if(globalmult == 5)// L/L ra
	{
		var red = 0;
		var blue = 0;
		var green = 0;
		var yellow = 0;
		var purple = 0;
		var heart = 0;

		all_matches.forEach(function(m) {
			if(m.type == 0) {red = 1;}
			if(m.type == 1) {blue = 1;}
			if(m.type == 2) {green = 1;}
			if(m.type == 3) {yellow = 1;}
			if(m.type == 4) {purple = 1;}
			if(m.type == 5) {heart = 1;}
		});

		var sum = red + blue + green + yellow + purple + heart;

		if (sum < 6)
			return 3*sum + 1;
		if (sum == 6)
			return 49;
	}


	if(globalmult == 6)//D/L Anubis
	{
		if(all_matches.length < 8)
			return all_matches.length*2;
		if(all_matches.length == 8)
			return 16;
		if(all_matches.length == 9)
			return 49;
		if(all_matches.length >= 10)
			return 100;
	}

	if(globalmult == 7)// Bastet
	{
		if(all_matches.length < 4)
			return all_matches.length;
		if(all_matches.length == 4)
			return 6.25;
		if(all_matches.length == 5)
			return 9;
		if(all_matches.length == 6)
			return 12.25;
		if(all_matches.length >= 7)
			return 16;
	}

	return 1;
}

function show_element_type(jqel, type) {
    jqel.removeClass('eX');
    for (var i = 0; i < TYPES; ++ i) {
        jqel.removeClass('e' + i);
    }
    jqel.addClass('e' + type);
}

function show_board(board) {
    for (var i = 0; i < ROWS; ++ i) {
        for (var j = 0; j < COLS; ++ j) {
            var type = board[i][j];
            if (typeof(type) == 'undefined') {
                type = 'X';
            }
            show_element_type($('#o' + i + '' + j), type);
        }
    }
}

function in_place_remove_matches(board, match_board) {
    for (var i = 0; i < ROWS; ++ i) {
        for (var j = 0; j < COLS; ++ j) {
            if (typeof(match_board[i][j]) != 'undefined') {
                board[i][j] = 'X';
            }
        }
    }
    return board;
}

function in_place_drop_empty_spaces(board) {
    for (var j = 0; j < COLS; ++ j) {
        var dest_i = ROWS-1;
        for (var src_i = ROWS-1; src_i >= 0; -- src_i) {
            if (board[src_i][j] != 'X') {
                board[dest_i][j] = board[src_i][j];
                -- dest_i;
            }
        }
        for (; dest_i >= 0; -- dest_i) {
            board[dest_i][j] = 'X';
        }
    }
    return board;
}

function can_move_orb(rc, dir) {
    switch (dir) {
        case 0: return                    rc.col < COLS-1;
        case 1: return rc.row < ROWS-1 && rc.col < COLS-1;
        case 2: return rc.row < ROWS-1;
        case 3: return rc.row < ROWS-1 && rc.col > 0;
        case 4: return                    rc.col > 0;
        case 5: return rc.row > 0      && rc.col > 0;
        case 6: return rc.row > 0;
        case 7: return rc.row > 0      && rc.col < COLS-1;
    }
    return false;
}

function in_place_move_rc(rc, dir) {
    switch (dir) {
        case 0:              rc.col += 1; break;
        case 1: rc.row += 1; rc.col += 1; break;
        case 2: rc.row += 1;              break;
        case 3: rc.row += 1; rc.col -= 1; break;
        case 4:              rc.col -= 1; break;
        case 5: rc.row -= 1; rc.col -= 1; break;
        case 6: rc.row -= 1;              break;
        case 7: rc.row -= 1; rc.col += 1; break;
    }
}

function in_place_swap_orb(board, rc, dir) {
    var old_rc = copy_rc(rc);
    in_place_move_rc(rc, dir);
    var orig_type = board[old_rc.row][old_rc.col];
    board[old_rc.row][old_rc.col] = board[rc.row][rc.col];
    board[rc.row][rc.col] = orig_type;
    return {board: board, rc: rc};
}

function copy_solution_with_cursor(solution, i, j, init_cursor) {
    return {board: copy_board(solution.board),
            cursor: make_rc(i, j),
            init_cursor: init_cursor || make_rc(i, j),
            path: solution.path.slice(),
            is_done: solution.is_done,
            weight: 0,
			mult: compute_mult(solution.board),
            matches: []};
}

function copy_solution(solution) {
    return copy_solution_with_cursor(solution,
                                     solution.cursor.row, solution.cursor.col,
                                     solution.init_cursor);
}

function make_solution(board) {
    return {board: copy_board(board),
            cursor: make_rc(0, 0),
            init_cursor: make_rc(0, 0),
            path: [],
            is_done: false,
            weight: 0,
            mult: compute_mult(board),
            matches: []};
}

function in_place_evaluate_solution(solution, weights) {
    var current_board = copy_board(solution.board);
    var all_matches = [];
    while (true) {
        var matches = find_matches(current_board);
        if (matches.matches.length == 0) {
            break;
        }
        in_place_remove_matches(current_board, matches.board);
        in_place_drop_empty_spaces(current_board);
        all_matches = all_matches.concat(matches.matches);
    }
    solution.weight = compute_weight(all_matches, weights);
	solution.mult = compute_mult(solution.board);
    solution.matches = all_matches;
    return current_board;
}

function can_move_orb_in_solution(solution, dir) {
    // Don't allow going back directly. It's pointless.
    if (solution.path[solution.path.length-1] == (dir + 4) % 8) {
        return false;
    }
    return can_move_orb(solution.cursor, dir);
}

function in_place_swap_orb_in_solution(solution, dir) {
    var res = in_place_swap_orb(solution.board, solution.cursor, dir);
    solution.cursor = res.rc;
    solution.path.push(dir);
}

function get_max_path_length() {
MAX_SOLUTIONS_COUNT = ROWS * COLS * $('#num-paths').val();
    return $('#max-length').val();
}

function is_8_dir_movement_supported() {
    return $('#allow-8')[0].checked;
}

function evolve_solutions(solutions, weights, dir_step) {
    var new_solutions = [];
    solutions.forEach(function(s) {
        if (s.is_done) {
            return;
        }
        for (var dir = 0; dir < 8; dir += dir_step) {
            if (!can_move_orb_in_solution(s, dir)) {
                continue;
            }
            var solution = copy_solution(s);
            in_place_swap_orb_in_solution(solution, dir);
            in_place_evaluate_solution(solution, weights);
            new_solutions.push(solution);
        }
        s.is_done = true;
    });
    solutions = solutions.concat(new_solutions);
    solutions.sort(function(a, b) { return (b.weight * b.mult) - (a.weight * a.mult); });
    return solutions.slice(0, MAX_SOLUTIONS_COUNT);
}

function solve_board(board, step_callback, finish_callback) {
    var solutions = new Array(ROWS * COLS);
    var weights = get_weights();

    var seed_solution = make_solution(board);
    in_place_evaluate_solution(seed_solution, weights);

    for (var i = 0, s = 0; i < ROWS; ++ i) {
        for (var j = 0; j < COLS; ++ j, ++ s) {
            solutions[s] = copy_solution_with_cursor(seed_solution, i, j);
        }
    }

    var solve_state = {
        step_callback: step_callback,
        finish_callback: finish_callback,
        max_length: get_max_path_length(),
        dir_step: is_8_dir_movement_supported() ? 1 : 2,
        p: 0,
        solutions: solutions,
        weights: weights,
    };

    solve_board_step(solve_state);
}

function solve_board_step(solve_state) {
    if (solve_state.p >= solve_state.max_length) {
        solve_state.finish_callback(solve_state.solutions);
        return;
    }

    ++ solve_state.p;
    solve_state.solutions = evolve_solutions(solve_state.solutions,
                                             solve_state.weights,
                                             solve_state.dir_step);
    solve_state.step_callback(solve_state.p, solve_state.max_length);

    setTimeout(function() { solve_board_step(solve_state); }, 0);
}

function add_solution_as_li(html_array, solution) {
    html_array.push('<li>W=');
    html_array.push(solution.weight.toFixed(2));
    html_array.push(', L=');
    html_array.push(solution.path.length);
    html_array.push(', M=');
    html_array.push(solution.mult.toFixed(2));
    html_array.push(', &#8623;=');
    html_array.push(getSimplePathXYs(solution).length-1);
    var sorted_matches = solution.matches.slice();
    sorted_matches.sort(function(a, b) {
        if (a.count != b.count) {
            return b.count - a.count;
        } else if (a.type > b.type) {
            return 1;
        } else if (a.type < b.type) {
            return -1;
        } else {
            return 0;
        }
    });
    sorted_matches.forEach(function(match, i) {
        html_array.push(', <span class="e');
        html_array.push(match.type);
        html_array.push('"></span> &times; ');
        html_array.push(match.count);
    });
    html_array.push('</li>');
}

function simplify_path(xys) {
    // 1. Remove intermediate points.
    var simplified_xys = [xys[0]];
    var xys_length_1 = xys.length - 1;
    for (var i = 1; i < xys_length_1; ++ i) {
        var dx0 = xys[i].x - xys[i-1].x;
        var dx1 = xys[i+1].x - xys[i].x;
        if (dx0 == dx1) {
            var dy0 = xys[i].y - xys[i-1].y;
            var dy1 = xys[i+1].y - xys[i].y;
            if (dy0 == dy1) {
                continue;
            }
        }
        simplified_xys.push(xys[i]);
    }
    simplified_xys.push(xys[xys_length_1]);

    return simplified_xys;
}

function simplify_solutions(solutions) {
    var simplified_solutions = [];
    solutions.forEach(function(solution) {
        for (var s = simplified_solutions.length-1; s >= 0; -- s) {
            var simplified_solution = simplified_solutions[s];
            if (!equals_rc(simplified_solution.init_cursor, solution.init_cursor)) {
                continue;
            }
            if (!equals_matches(simplified_solution.matches, solution.matches)) {
                continue;
            }
            return;
        }
        simplified_solutions.push(solution);
    });
    return simplified_solutions;
}

function draw_line_to(canvas, px, py, x, y) {
    var mx = (px*2 + x) / 3;
    var my = (py*2 + y) / 3;
    canvas.lineTo(mx, my);
    var dx = x - px;
    var dy = y - py;
    var dr = Math.sqrt(dx*dx + dy*dy) / 3;
    dx /= dr;
    dy /= dr;
    canvas.lineTo(mx - (dx+dy), my + (dx-dy));
    canvas.lineTo(mx - (dx-dy), my - (dx+dy));
    canvas.lineTo(mx, my);
    canvas.lineTo(x, y);
}

function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}

function draw_line_to2(canvas, px, py, x, y) {
    var dr = 0.1;
    var dx = ORB_WIDTH  * dr * sign(x - px);
    var dy = ORB_HEIGHT * dr * sign(y - py);
    canvas.lineTo(px + dx, py + dy);
    canvas.lineTo( x - dx,  y - dy);
}

function draw_path(init_rc, path) {
    var canvas = clear_canvas();
    var rc = copy_rc(init_rc);
    var xys = [to_xy(rc)];
    path.forEach(function(p) {
        in_place_move_rc(rc, p);
        xys.push(to_xy(rc));
    });

    xys = simplify_path(xys);
    if ( drawstyle == "rounded" ) {
        avoid_overlap(xys);
    }

    canvas.lineWidth = 4;
    canvas.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    canvas.beginPath();
    for (var i = 0; i < xys.length; ++ i) {
        var xy = xys[i];
        if (i == 0) {
            canvas.moveTo(xy.x, xy.y);
        } else {
            var prev_xy = xys[i-1];
	    if ( drawstyle == "rounded" ) {
                draw_line_to2(canvas, prev_xy.x, prev_xy.y, xy.x, xy.y);
	    } else {
                draw_line_to(canvas, prev_xy.x, prev_xy.y, xy.x, xy.y);
	    }
        }
    }
    canvas.stroke();

    var init_xy = xys[0];
    var final_xy = xys[xys.length-1];

    canvas.lineWidth = 2;
    canvas.fillStyle = 'red';
    canvas.strokeStyle = 'black';
    canvas.beginPath();
    canvas.rect(init_xy.x-5, init_xy.y-5, 10, 10);
    canvas.fill();
    canvas.stroke();

    canvas.fillStyle = 'lime';
    canvas.beginPath();
    canvas.rect(final_xy.x-5, final_xy.y-5, 10, 10);
    canvas.fill();
    canvas.stroke();

    return xys;
}

function clear_canvas() {
    var canvas_elem = $('#path')[0];
    var canvas = canvas_elem.getContext('2d');
    canvas.clearRect(0, 0, canvas_elem.width, canvas_elem.height);
    $('#hand').hide();
    return canvas;
}

var global_board = create_empty_board();
var global_solutions = [];
var global_unsimplified = [];
var global_index = 0;
var drawstyle;

$(document).ready(function() {

    // Better position the solutions div based on dynamic values
    var navbar_height = $('.navbar-fixed-bottom').outerHeight();
    var second_navbar_height = $('.secondary-navbar-bottom').outerHeight();
    $('#solutions').css('min-height', $(window).height() - (navbar_height + second_navbar_height - 60));
    $('[id^="grid"] > div').each(function() {
        $(this).addClass('eX');
    })

    $('[id^="grid"] > div, .change-target').mousedown(function(e) {
        var type = get_type(this);
        var target_type;
        switch (e.which) {
            case 1: target_type = advance_type(type, 1); break;     // left
            case 3: target_type = advance_type(type, -1); break;    // right
            case 2: target_type = 'X'; break;                       // middle
            default: break;
        }
        show_element_type($(this), target_type);
        clear_canvas();
    });

    $('#hand, #import-popup, #change-popup').hide();

    $('#profile-selector').change(function() {
        var values = this.value.replace(/\s+/g, '').split(/,/);
        for (var i = 0; i < TYPES; ++ i) {
            $('#e' + i + '-normal').val(values[4*i]);
            $('#e' + i + '-mass').val(values[4*i+1]);
			$('#e' + i + '-row').val(values[4*i+2]);
			$('#e' + i + '-tpa').val(values[4*i+3]);
        }
		globalmult = values[4*TYPES];
    });

    $('#traditional').click(function() {
	drawstyle = "traditional";
    });

    $('#nooverlap').click(function() {
	drawstyle = "rounded";
    });

    $('#solve').click(function() {
        $('[id^="grid"] > div').each(function(){ $(this).removeClass('border-flash'); });
        var solver_button = this;
        var board = get_board();
        global_board = board;
        solver_button.disabled = true;
        $('.loading-throbber').fadeToggle('fast');
        solve_board(board, function(p, max_p) {
            //console.log(p);
            //console.log(max_p);
            var result = parseInt(p * 100 / parseInt(max_p));
            $('#are-you-ready').remove();
            if ($('#status').hasClass('active')) {
            $('#solutions ol li').fadeToggle();
            $('#status').removeClass('active');
            }
            $('#status').text('Solving ( ' + result + '% )');
        }, function(solutions) {
            $('.loading-throbber').fadeToggle();
            var html_array = [];
	    global_unsimplified = solutions;
            solutions = simplify_solutions(solutions);
            global_solutions = solutions;
            solutions.forEach(function(solution) {
                add_solution_as_li(html_array, solution, board);
            });
            $('#solutions > ol').html(html_array.join(''));
            solver_button.disabled = false;
            $('#status').addClass('active');
        });
    });

    $('#pathincrease').click(function() {
        $('[id^="grid"] > div').each(function(){ $(this).removeClass('border-flash'); });
        board = global_board
        $('.loading-throbber').fadeToggle('fast');
        lengthenSolution(board, global_unsimplified, function(p, max_p) {
            //console.log(p);
            //console.log(max_p);
            var result = parseInt(p * 100 / parseInt(max_p));
            $('#are-you-ready').remove();
            if ($('#status').hasClass('active')) {
            $('#solutions ol li').fadeToggle();
            $('#status').removeClass('active');
            }
            $('#status').text('Solving ( ' + result + '% )');
        }, function(solutions) {
            $('.loading-throbber').fadeToggle();
            var html_array = [];
	    global_unsimplified = solutions;
            solutions = simplify_solutions(solutions);
            global_solutions = solutions;
            solutions.forEach(function(solution) {
                add_solution_as_li(html_array, solution, board);
            });
            $('#solutions > ol').html(html_array.join(''));
            $('#status').addClass('active');
        });
    });

    $('#solutions').on('click', 'li', function(e) {
        show_board(global_board);
        global_index = $(this).index();
        var solution = global_solutions[global_index];
        var path = draw_path(solution.init_cursor, solution.path);
        var hand_elem = $('#hand');
        hand_elem.stop(/*clearQueue*/true).show();
        path.forEach(function(xy, i) {
	if ( COLS == "5" ) {
            var left = xy.x + 46;
	} else {
            var left = xy.x + 14;
	}
            var top = xy.y + 14;
            hand_elem[i == 0 ? 'offset' : 'animate']({left: left, top: top});
        });
        $('#solutions li.prev-selection').removeClass('prev-selection');
        $(this).addClass('prev-selection');
    });

    $('#randomize').click(function() {
        var types = $('#randomization-type').val().split(/,/);
		do{
        $('[id^="grid"] > div').each(function() {
            var index = Math.floor(Math.random() * types.length);
            show_element_type($(this), types[index]);
        });
		var board = get_board();
		}
		while(find_matches(board).matches.length != 0);
        clear_canvas();
    });

    $('#clear').click(function() {
        $('[id^="grid"] > div').each(function() { show_element_type($(this), 'X'); });
        clear_canvas();
    });

    $('#drop').click(function() {
        var solution = global_solutions[global_index];
        if (!solution) {
            return;
        }
        var board = in_place_evaluate_solution(solution, get_weights());
        show_board(board);
        clear_canvas();
    });

    $('#final').click(function() {
        var solution = global_solutions[global_index];
        if (solution) {
            show_board(solution.board);
        }
    });

    $('#import').click(function() {
        var board = get_board();
        var type_chars = 'rbgyphj';
        var content = board.map(function(row) { return row.join(''); }).join('')
            .replace(/X/g, 'x')
            .replace(/(\d)/g, function(s) { return type_chars.charAt(s); });
        $('#import-textarea').val(content);
        $('#import-popup').show();
	document.getElementById("import-textarea").select();
    });

    $('#change').click(function() { $('#change-popup').show(); });
    $('#import-cancel').click(function() { $('#import-popup').hide(); });
    $('#change-cancel').click(function() { $('#change-popup').hide(); });

    $('#import-import').click(function() {
        var board_raw = $('#import-textarea').val();
        var board_joined = board_raw
                .replace(/r/gi, '0')
                .replace(/b/gi, '1')
                .replace(/g/gi, '2')
                .replace(/y/gi, '3')
                .replace(/p/gi, '4')
                .replace(/h/gi, '5')
                .replace(/j/gi, '6')
                .replace(/\s/g, '')
                .replace(/[^0-6]/g, 'X');
        if (board_joined.length != ROWS * COLS) {
            alert('Wrong number of orbs!');
            return;
        }
	var boardre = new RegExp(".{" + COLS + "}", 'g');
        var board = board_joined.match(boardre).map(function(s) { return s.split(''); });
        show_board(board);
        clear_canvas();
        $('#import-popup').hide();
    });

    $('#change-change').click(function() {
        var change_targets = $('.change-target').map(function() {
            return get_type(this);
        });
        var board = get_board();
        for (var i = 0; i < ROWS; ++ i) {
            for (var j = 0; j < COLS; ++ j) {
                var type = board[i][j];
                if (type == 'X') {
                    type = change_targets[change_targets.length-1];
                } else {
                    type = change_targets[type];
                }
                board[i][j] = type;
            }
        }
        show_board(board);
        clear_canvas();
        $('#change-popup').hide();
    });
});

function getSimplePathXYs(solution) {
  if (solution.simplyXYs) {
    return solution.simplyXYs; //solved already
  }
  var init_rc = solution.init_cursor;
  var path = solution.path;
  var rc = new Coordinate(init_rc.row, init_rc.col);
  var xys = [rc.getXY()];
  path.forEach(function (p) {
    in_place_move_rc(rc, p);
    xys.push(rc.getXY());
  });

  return simplify_path(xys);
}

function lengthenSolution (board, solutions, step_callback, finish_callback) {
    var weights = get_weights();

    var seed_solution = make_solution(board);
    in_place_evaluate_solution(seed_solution, weights);

    for (var i = 0, s = 0; i < ROWS; ++ i) {
        for (var j = 0; j < COLS; ++ j, ++ s) {
            solutions.push(copy_solution_with_cursor(seed_solution, i, j));
        }
    }

    var oldmax = parseInt(get_max_path_length());
    var newmax = oldmax + 1;

    var solve_state = {
        step_callback: step_callback,
        finish_callback: finish_callback,
        max_length: newmax,
        dir_step: is_8_dir_movement_supported() ? 1 : 2,
        p: oldmax,
        solutions: solutions,
        weights: weights,
    };
    $('#max-length').val(solve_state.max_length);
    solve_board_step(solve_state);
}

function Coordinate(row, col){
  this.row = row || 0;
  this.col = col || 0;
}

Coordinate.prototype.getXY = function(){
  var x = this.col * ORB_X_SEP + ORB_WIDTH/2;
  var y = this.row * ORB_Y_SEP + ORB_HEIGHT/2;
  return {x: x, y: y};
};


function avoid_overlap(xys) {
    var rail_num = 5; // should be odd integer
    var rail_half = Math.floor(rail_num / 2);
    var dr = Math.max(0.08, 0.4 / rail_num);
    var rail_x = {};
    var rail_y = {};
    for (var i = 1; i < xys.length; ++ i) {
        if (xys[i].y == xys[i-1].y) {
            y = xys[i].y;
            rail_y[y] = rail_y[y] || 0;
            var dy = ORB_HEIGHT * (rail_y[y] - rail_half) * dr;
            rail_y[y] = (rail_y[y] + rail_half) % rail_num;
            xys[i].y += dy;
            xys[i-1].y += dy;
        } else if (xys[i].x == xys[i-1].x) {
            x = xys[i].x;
            rail_x[x] = rail_x[x] || 0;
            var dx = ORB_WIDTH * (rail_x[x] - rail_half) * dr;
            rail_x[x] = (rail_x[x] + rail_half) % rail_num;
            xys[i].x += dx;
            xys[i-1].x += dx;
        }
    }
    return xys;
}
