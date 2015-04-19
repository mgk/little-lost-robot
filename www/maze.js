//
// maze.js
//
(function(g, $) {

	//
	// class Maze
	//

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

	function extractRobot(rowStrings) {
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

	function reset(maze, data) {
		var rowStrings = trimEmpty(data.split(/[\n\r]+/));
		var ncolumns = maxStrLen(rowStrings);
		var startingPos = extractRobot(rowStrings);
		var grid = toBooleans(rowStrings, ncolumns);

		maze.grid = grid;
		maze.ncolumns = ncolumns;
		maze.startingPos = startingPos;
		maze.facing = { x: -1, y: 0 };
		maze.tokens = {};
		maze.pos = $.extend({}, maze.startingPos);
	}

	function isWithin(maze, x, y) {
		return x >= 0 && x < maze.grid.length && y >= 0 && y < maze.ncolumns; 
	}

	function positionString(maze, x, y) {
		return !isWithin(maze, x, y) ? "-" : (x + "," + y);
	}

	function robotIsAt(maze, x, y) {
		return x == maze.pos.x && y == maze.pos.y;
	}

	function whatsAt(maze, x, y) {
		if (!isWithin(maze, x, y)) {
			return undefined;
		}
		return {
			blocked: maze.grid[x][y],
			robot: robotIsAt(maze, x, y) ? $.extend({}, maze.facing) : undefined,
			token: maze.tokens[positionString(maze, x, y)]
		};
	}

	function registerChangeListener(maze, listener) {
		maze.listeners.push(listener);
	}

	function fireChangeEvent(maze) {
		for (var i = 0; i < maze.listeners.length; ++i) {
			maze.listeners[i].call();
		}
	}

	function createRobot(maze) {
		return {
			inMaze: function() {
				return isWithin(maze, maze.pos.x, maze.pos.y);
			},

			lookAhead: function() {
				var x = maze.pos.x + maze.facing.x;
				var y = maze.pos.y + maze.facing.y;
				if (!isWithin(maze, x, y)) {
					return {};
				}
				if (maze.grid[x][y]) {
					return false;
				}
				return {
                    token: maze.tokens[positionString(maze, x, y)]
                };
			},

            _doRot: function() {
				var x = maze.facing.x;
				var y = maze.facing.y;
				maze.facing.x = x ? 0 : y;
				maze.facing.y = y ? 0 : x;
            },

			rotateLeft: function() {
                this._doRot();
				fireChangeEvent(maze);
			},

			rotateRight: function() {
                this._doRot();
				maze.facing.x *= -1;
				maze.facing.y *= -1;
				fireChangeEvent(maze);
			},

			move: function() {
				if (!isWithin(maze, maze.pos.x, maze.pos.y)) {
					throw "already outside maze";
				}
				var x = maze.pos.x + maze.facing.x;
				var y = maze.pos.y + maze.facing.y;
				if (maze.grid[x][y]) {
					throw "blocked";
				}
				maze.pos.x = x;
				maze.pos.y = y;
				fireChangeEvent(maze);
			},

			dropToken: function(token) {
				maze.tokens[positionString(maze, maze.pos.x, maze.pos.y)] = token;
				fireChangeEvent(maze);
			},

            getToken: function() {
				return maze.tokens[positionString(maze, maze.pos.x, maze.pos.y)];
            }
		};
	}

	function createCopy(maze) {
		var maze2 = new Maze(maze.options);
		maze2.grid = maze.grid;
		maze2.ncolumns = maze.ncolumns;
		maze2.startingPos = maze.startingPos;
		maze2.facing = $.extend({}, maze.facing);
		maze2.tokens = $.extend({}, maze.tokens);
		maze2.pos = $.extend({}, maze.pos);
		return maze2;
	}

	var Maze = function(options) {
		this.options = $.extend({}, defaultOptions, options);
		this.facing = {};
		this.listeners = [];
		reset(this, "");
	};
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
			var self = this;
			return $.ajax(self.options.datafile, {
				method: "GET",
				dataType: "text",
				dataFilter: function(data) {
					reset(self, data);
					fireChangeEvent(self);
					return self;
				}
			});
		},
		registerChangeListener: function(listener) {
			registerChangeListener(this, listener);
		},
		getRobot: function() {
			return createRobot(this);
		},
		copy: function() {
			return createCopy(this);
		}
	};

	g.Maze = Maze;
})(window, window.jQuery);
