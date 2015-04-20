# Little Lost Robot

A Javascript programming challenge.

*Can you help the robot escape the maze?*

Version 0.1 BETA

## Getting Started

- Fork and clone this repo.
- Install NPM and NodeJS.
- In the root directory, run `npm install`, then `node app.js` to start the server
- Browse to [http://localhost:3003](http://localhost:3003)
- Read on for details!

## Objective

The object of this challenge is to steer a robot out of a 2-D maze.  The maze is
a grid of squares, some of which are filled by walls.  If your robot moves out
of the maze, you win.  If you steer the robot into a wall, you fail.  If your
code throws an error, you fail.  If there is no way out of the maze, you should
power down the robot and send up a flare.

## Framework

You accomplish this objective by programming a guidance system for a new robot 
type.  A robot's guidance system consists of one function, the `steer` function. 
The `steer` function is called when the robot moves into a square.  When the
`steer` function gives up control by returning, the robot will move, unless the
`steer` function has shut down the robot's motor, causing it to stop moving. 
Your `steer` function should shut down the robot's motor only if you are sure
that there is no escape route from the maze.  Otherwise, your `steer` function
must rotate the robot to face an empty square.  Your robot is very fragile; if
it moves into a wall, it is destroyed!

The files in `./robots` are sample implementations.  Add your implementation
to this folder.  You may use `./robots/template.js`, or any of the others,
as a template.

## Robot API

The guidance system has only limited access to the robot's other systems, which 
include a forward-facing sensor, a steering column, and an unlimited supply of 
"tokens" that the robot may drop from its undercarriage.  These functions are 
methods of the robot object, accessable in the `steer` function via `this`. 
The API is described below.  There is no way for the robot to examine the maze
beyond its limited scope.

### isFacingWall()

Self-explanatory.  Returns true or false.

### rotate(a)

Rotate the robot `a` times 90 degrees.  Negative values of `a` rotate
in one direction; positive in the other.  Return the robot, for 
chaining.
       
### dropToken(token)

The robot drops a token into the square it currently occupies.  `token`
may be any value.  Any prior token value in the square is lost.  Return
the robot, for chaining.

### tokenHere()

Return the token found in the current square, or undefined if there is
none.  

### tokenAhead()

Return the token found in the square that the robot is facing, or
undefined if there is none. 

(Note: modifying the token value returned by this function in place, if
possible, is contrary to the spirit of this challenge!  Instead, let the
robot move into the space and drop a new token.)

TODO: restrict token types in dropToken.

### quit()

Shut down the robot's motor!  This is the way to declare that the
maze has no way of escape, which is the only way to "win" the challenge
in the case of a hopeless maze.

Good luck!
