//
// maze.js
//
(function(g, $) {

	var ROBOT_OK = 0;
	var ROBOT_SMASHED = 1;
	var ROBOT_QUIT = 2;
	var ROBOT_ERROR = 3;

	function maxStrLen(strings) {
		var max = 0;
		for (var i = 0; i < strings.length; ++i) {
			max = Math.max(max, strings[i].length);
		}
		return max;
	}

	function findAndRemoveStartMarker(rowStrings) {
		for (var i = 0; i < rowStrings.length; ++i) {
			var m = rowStrings[i].match(/^(.*)\^/);
			if (m) {
				rowStrings[i] = rowStrings[i].replace("^", " ");
				return { x: i, y: m[1].length };
			}
		}
		return { x: -1, y: -1 };  // No robot found.  Must have escaped.
	}

	function toBooleans(strings, length) {
		var bools = [];
		for (var i = 0; i < strings.length; ++i) {
			bools[i] = [];
			for (var j = 0; j < length; ++j) {
				bools[i][j] = j < strings[i].length && strings[i].charAt(j) != ' ';
			}
		}
		return bools;
	}

	function parseMaze(data) {
		var rowStrings = $.isArray(data.plan) ? data.plan : [];
		var ncolumns = maxStrLen(rowStrings);
		var startingPos = findAndRemoveStartMarker(rowStrings);
		var grid = toBooleans(rowStrings, ncolumns);
		var maze = new Maze(grid, ncolumns, startingPos);
		maze.title = data.title || "Untitled";
		maze.author = data.author || null;
		return maze;
	}

	function isWithin(maze, x, y) {
		return x >= 0 && x < maze.grid.length && y >= 0 && y < maze.ncolumns; 
	}

	function isWall(maze, x, y) {
		return isWithin(maze, x, y) && maze.grid[x][y];
	}

	function positionString(maze, x, y) {
		return !isWithin(maze, x, y) ? "-" : (x + "," + y);
	}

	function putToken(maze, x, y, token) {
		maze.tokens[positionString(maze, x, y)] = token;
	}

	function getToken(maze, x, y) {
		return maze.tokens[positionString(maze, x, y)];
	}

	function robotIsAt(maze, x, y) {
		return maze.robot && x == maze.robot.pos.x && y == maze.robot.pos.y;
	}

	function robotFacingWall(robot) {
		return isWall(
			robot.maze,
			robot.pos.x + robot.facing.x,
			robot.pos.y + robot.facing.y);
	}

	function moveRobot(robot) {
		if (robot.status == ROBOT_OK) {
			if (robotFacingWall(robot)) {
				robot.status = ROBOT_SMASHED;
			}
			else {
				robot.pos.x += robot.facing.x;
				robot.pos.y += robot.facing.y;
			}
		}
	}

	function rotateRobot(robot, turns) {
		var x = robot.facing.x;
		var y = robot.facing.y;
		// Normalize angle to 4 possibilities.
		if (turns < 0) {
			turns *= -1;
			if (turns % 2 != 0) {
				turns += 2;
			}
		}
		switch (turns % 4) {
		case 1:   // turn right
			robot.facing.x = x ? 0 : y;
			robot.facing.y = y ? 0 : -x;
			break;
		case 2:  // about face
			robot.facing.x = -x;
			robot.facing.y = -y;
			break;
		case 3:  // turn left
			robot.facing.x = x ? 0 : -y;
			robot.facing.y = y ? 0 : x;
		}
	}

	function installGuidanceSystem(robot, initGuidanceSystem)
	{
		var maze = robot.maze;
		// Here is the side of a robot that only the navigator sees.
		var facade = {
			title: "Untitled",
			quit: function() {
				robot.status = ROBOT_QUIT;
			},
			isFacingWall: function() {
				return robotFacingWall(robot);
			},
			tokenAhead: function() {
				return getToken(maze, robot.pos.x + robot.facing.x,
					robot.pos.y + robot.facing.y);
			},
			tokenHere: function() {
				return getToken(maze, robot.pos.x, robot.pos.y);
			},
			dropToken: function(token) {
				putToken(maze, robot.pos.x, robot.pos.y, token);
				return this;
			},
			rotate: function(turns) {
				rotateRobot(robot, turns);
				return this;
			}
		};
        initGuidanceSystem.call(facade);

		robot.title = facade.title;
		robot.author = facade.author;
		robot.description = facade.description;
		robot.steerFunc = function() {
			try {
				facade.steer();
			}
			catch (e) {
				robot.status = ROBOT_ERROR;
				console.log(e);
			}
		};
	}

	var Robot = function(maze) {
		this.maze = maze;
		this.status = ROBOT_OK;
		this.facing = { x: -1, y: 0 };
		this.pos = $.extend({}, maze.startingPos);
	}
	Robot.prototype = {
		inMaze: function() {
			return isWithin(this.maze, this.pos.x, this.pos.y);
		},
		steer: function() {
			this.steerFunc && this.steerFunc();
		},
		move: function() {
			return moveRobot(this);
		}
	};

	var Maze = function(grid, ncolumns, startingPos) {
		this.grid = grid;
		this.ncolumns = ncolumns;
		this.startingPos = startingPos;
		this.tokens = {};
	};
	Maze.ROBOT_OK = ROBOT_OK;
	Maze.ROBOT_SMASHED = ROBOT_SMASHED;
	Maze.ROBOT_QUIT = ROBOT_QUIT;
	Maze.ROBOT_ERROR = ROBOT_ERROR;
	Maze.parse = parseMaze;
	Maze.prototype = {
		getDimensions: function() {
			return { rows: this.grid.length, columns: this.ncolumns };
		},
		isWall: function(x, y) {
			return isWall(this, x, y);
		},
		getToken: function(x, y) {
			return getToken(this, x, y);
		},
		clearTokens: function() {
			this.tokens = {};
		},
		createRobot: function(guidanceSystem) {
			var robot = new Robot(this);
			if (guidanceSystem) {
				installGuidanceSystem(robot, guidanceSystem);
			}
			return this.robot = robot;
		},
		resetRobot: function(robot) {
			robot.pos = $.extend({}, this.startingPos);
		}
	};

	g.Maze = Maze;
})(window, window.jQuery);
