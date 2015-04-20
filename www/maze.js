//
// maze.js
//
(function(g, $) {

	var ROBOT_OK = 0;
	var ROBOT_SMASHED = 1;
	var ROBOT_QUIT = 2;

	var defaultOptions = {
		datafile: "maze.txt"
	};

	function trimEmpty(strings) {
		while (strings.length > 0 && strings[strings.length - 1].trim() == ""){
			strings = strings.slice(0, strings.length - 1);
		}
		return strings;
	}

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

	function loadMaze(maze) {
		return $.ajax(maze.options.datafile, {
			method: "GET",
			dataType: "text",
			dataFilter: function(data) {
				var rowStrings = trimEmpty(data.split(/[\n\r]+/));
				var ncolumns = maxStrLen(rowStrings);
				maze.startingPos = findAndRemoveStartMarker(rowStrings);
				maze.grid = toBooleans(rowStrings, ncolumns);
				maze.ncolumns = ncolumns;
				return maze;
			}
		});
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

	function whatsAt(maze, x, y) {
		if (!isWithin(maze, x, y)) {
			return null;
		}
		return {
			blocked: maze.grid[x][y],
			robot: robotIsAt(maze, x, y) ? $.extend({}, maze.robot.facing) : undefined,
			token: getToken(maze, x, y)
		};
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
		move: function() {
			return moveRobot(this);
		},
		getControls: function() {
			var robot = this;
			var maze = robot.maze;
			return {
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
				},
				rotate: function(turns) {
					rotateRobot(robot, turns);
				}
			};
		}
	};

	var Maze = function(options) {
		this.options = $.extend({}, defaultOptions, options);
		this.grid = [];
		this.ncolumns = 0;
		this.startingPos = { x: 0, y: 0 };
		this.tokens = {};
	};
	Maze.ROBOT_OK = ROBOT_OK;
	Maze.ROBOT_SMASHED = ROBOT_SMASHED;
	Maze.ROBOT_QUIT = ROBOT_QUIT;
	Maze.prototype = {
		getTitle: function() {
			return this.options.datafile;
		},
		getDimensions: function() {
			return { rows: this.grid.length, columns: this.ncolumns };
		},
		whatsAt: function(x, y) {
			return whatsAt(this, x, y);
		},
		load: function() {
			return loadMaze(this);
		},
		getRobot: function() {
			return this.robot = new Robot(this);
		}
	};

	g.Maze = Maze;
})(window, window.jQuery);
