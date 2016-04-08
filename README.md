padopt - a Puzzle & Dragons Optimizer
=====================================

![Screenshot](screenshot1.png)
![Screenshot](screenshot2.png)

`padopt` is a Javascript-based web application that finds optimal paths in the mobile game Puzzle & Dragons.

Originally forked from kennytm's [pndopt](https://github.com/kennytm/pndopt) and based on [combo.tips](http://combo.tips). 90% of the credit goes to the aforementioned, including the main Javascript logic.

This fork redesign a whole new responsive UI with friendly mobile support. Single page app support all grid size (so you can keep your profile when switching between grid size). Rewrite most of the JavaScript to make the code clean. A new client side image analysis JavaScript that let you import from screenshot, without uploading the image to server.

Usage
-----

1. (Optional) Select a profile to get better boards.
2. Left or right click on an orb to select its type.
3. Click "Solve" after completing the board.
4. Choose one solution and see how it is performed.

I recommend using this tool to check solutions and for learning purposes; it rarely if ever gives a truly optimal board solution and does not take into account unprotected cascades, orb movement timer, complexity of the path, and other details. That being said, do what you like with it.  ¯\\_(ツ)_/¯

Profiles and Calculations
-------------------------

All these do is change the weights of specific orb combinations to change the multiplier value of given solutions. Despite Rows being one of the possible inputs it does a pretty awful job of doing it. I wouldn't recommend using this tool for Row teams (and honestly you shouldn't need to given that they're almost never combo reliant).

For each main attribute add 1 to that color under 'N.' You can optionally add .3 to the columns for sub attributes but it won't change your results much. For color combo leads such as Kali, just put 1 for required colors and 0 for everything else.

For TPA calculations, each TPA on the monster is an additional 1.5 multiplier:

`tpa = 1*(1.5)^n - 1`

Add the resulting weights for each color.

For example, if you have 3 green monsters and one has a TPA and the other has two TPA, the base weight is 3 and the TPA effect is 1 x 1.5 for the single TPA (.5 extra) and 1 x 1.5 x 1.5 = 2.25 (1.25 extra) for the double TPA so you enter 1.75.

Alternatively just put 1 where you have TPAs and 0 where you don't.

New Predefined Profile
------------

Profiles are now define in profile.js. Feel free to add new profile and send me a pull request.
You can also create your own customized profile and save in browser (localStorage).

Requirements
------------

* An updated browser - preferably chromium or Firefox.
* Javascript enabled.

TODO
----

* Introduce better solver (e.g. [this post](http://puzzleanddragonsforum.com/showthread.php?tid=1603&pid=6263#pid6263)). Currently just a brute-force greedy algorithm, which may not produce truly optimal results.
* Resolve overlapping lines and points.
* Simulate swapping and matching when playing the animation and dropping the matches.
* The default weight of the profiles may need to be adjusted.
* Image analysis: enhance orb shape analysis
