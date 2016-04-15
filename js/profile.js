'use strict';

var Profile = function(){
  var DEFAULT_PROFILE = {
    name: '--Default--',
    weights: [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
    multiple_formula: {
      base_multiple: 1,
      combo_mode: false,
      combo_from: 1,
      combo_multiple: 1,
      combo_additional_multiple: 1,
      combo_upto: 1,
      orbs_mode: false,
      orbs: ['0','1','2','3','4'],
      orbs_count_from: 1,
      orbs_count_upto: 1,
      orbs_multiple: 1,
      orbs_additional_multiple: 0,
      connected_orbs_mode: false,
      connected_multiple: 1,
      connected_count_from: 3,
      connected_count_upto: 4,
      connected_additional_multiple: 0,
      connected_orbs: ['0','1','2','3','4'],
    }
  };
  // profile storing weights, and multiple settings
  var _profiles = {
    "default": DEFAULT_PROFILE,
    "id_2009": {
      name: "2009 Awoken Horus",
      weights: [1,1,0,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: false,
        combo_from: 1,
        combo_multiple: 1,
        combo_additional_multiple: 1,
        combo_upto: 1,
        orbs_mode: true,
        orbs: ['0','1','2','3','4'],
        orbs_count_from: 4,
        orbs_count_upto: 5,
        orbs_multiple: 4,
        orbs_additional_multiple: 0.5,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2011": { // http://puzzledragonx.com/en/monster.asp?n=2011
      name: "2011 Awoken Bastet",
      weights: [1,1,0,0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: true,
        combo_from: 5,
        combo_multiple: 3,
        combo_additional_multiple: 0.5,
        combo_upto: 7,
        orbs_mode: false,
        orbs: ['1','2','3','4','5'],
        orbs_count_from: 4,
        orbs_count_upto: 4,
        orbs_multiple: 5,
        orbs_additional_multiple: 0,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2013": { // http://puzzledragonx.com/en/monster.asp?n=2013
      name: "2013 Awoken Anubis",
      weights: [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: true,
        combo_from: 9,
        combo_multiple: 4,
        combo_additional_multiple: 2,
        combo_upto: 12,
        orbs_mode: false,
        orbs: ['1','2','3','4','5'],
        orbs_count_from: 4,
        orbs_count_upto: 4,
        orbs_multiple: 5,
        orbs_additional_multiple: 0,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2076": {
      name: "2076 Awoken Haku",
      weights: [1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1.25,1,1,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: false,
        combo_from: 1,
        combo_multiple: 1,
        combo_additional_multiple: 1,
        combo_upto: 1,
        orbs_mode: true,
        orbs: ['0','1','4','5'],
        orbs_count_from: 3,
        orbs_count_upto: 3,
        orbs_multiple: 3.5,
        orbs_additional_multiple: 0,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2279": {
      name: "2279 Vigorous Hunt Gods, Umisachi & Yamasachi",
      weights: [0,0,0,0,1,1,0,1.25,1,1,0,0,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: false,
        combo_from: 1,
        combo_multiple: 1,
        combo_additional_multiple: 1,
        combo_upto: 1,
        orbs_mode: true,
        orbs: ['1','2','3','4'],
        orbs_count_from: 4,
        orbs_count_upto: 4,
        orbs_multiple: 5,
        orbs_additional_multiple: 0,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2389": {
      name: "2389 Awoken Sakuya",
      weights: [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0,0,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: true,
        combo_from: 6,
        combo_multiple: 1.2,
        combo_additional_multiple: 0.2,
        combo_upto: 10,
        orbs_mode: true,
        orbs: ['0','1','2','3'],
        orbs_count_from: 4,
        orbs_count_upto: 4,
        orbs_multiple: 5,
        orbs_additional_multiple: 0,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2594": {
      name: "2594 Anti-God Machine, Ragnarok Dragon",
      weights: [1,1,0,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1.5,
        combo_mode: false,
        combo_from: 1,
        combo_multiple: 1,
        combo_additional_multiple: 1,
        combo_upto: 1,
        orbs_mode: true,
        orbs: ['0','1','2','3','4'],
        orbs_count_from: 4,
        orbs_count_upto: 5,
        orbs_multiple: 4,
        orbs_additional_multiple: 0.5,
        connected_orbs_mode: false,
        connected_multiple: 1,
        connected_count_from: 3,
        connected_count_upto: 4,
        connected_additional_multiple: 0,
        connected_orbs: ['0','1','2','3','4'],
      }
    },
    "id_2661": {
      name: "2661 Cruel Bleak Night Goddess, Pandora",
      weights: [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,2,0.5,0.3,0.3,0,0,0.1,0.1,0,0,0.1,0.1,0,0,0.1,0.1,0,0],
      multiple_formula: {
        base_multiple: 1,
        combo_mode: false,
        combo_from: 1,
        combo_multiple: 1,
        combo_additional_multiple: 1,
        combo_upto: 1,
        orbs_mode: false,
        orbs: ['0','1','2','3','4'],
        orbs_count_from: 1,
        orbs_count_upto: 1,
        orbs_multiple: 1,
        orbs_additional_multiple: 0,
        connected_orbs_mode: true,
        connected_multiple: 2,
        connected_count_from: 4,
        connected_count_upto: 10,
        connected_additional_multiple: 0.5,
        connected_orbs: ['4'],
      }
    },
    "customize_profile": $.extend({}, DEFAULT_PROFILE, {name: '--New Customize Profile--'}),
  };

  /*************************************************************************
  * public methods
  **************************************************************************/
  return {
    saveCustomizeProfile: function(id, profile) {
      localStorage.setItem(id, JSON.stringify(profile));
    },
    deleteCustomizeProfile: function(id) {
      if (id.startsWith('customize_profile_')) {
        localStorage.removeItem(id);
      }
    },
    getProfile: function(id){
      var found_profile = DEFAULT_PROFILE;
      if (typeof(_profiles[id]) !== 'undefined') {
        found_profile = _profiles[id];
      } else if (id.startsWith('customize_profile_')) {
        found_profile = JSON.parse(localStorage.getItem(id));
      }
      // make sure multiple_formula have all keys (backward complatable)
      var multiple_formula = $.extend({}, DEFAULT_PROFILE.multiple_formula, found_profile.multiple_formula);
      found_profile.multiple_formula = multiple_formula;
      return $.extend({key: id}, found_profile);
    },
    getProfileOptions: function(){
      var cp_keys = [];
      for (var key in localStorage){
        if (key.startsWith('customize_profile_')) {
          cp_keys.push(key);
        }
      }
      var preset_profiles = Object.keys(_profiles).map(function(key){ return [_profiles[key].name, key]; });
      return preset_profiles.concat(cp_keys.map(function(key){
        return [JSON.parse(localStorage.getItem(key)).name, key];
      }));
    }
  };
};
