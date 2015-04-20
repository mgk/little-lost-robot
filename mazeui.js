//
// mazeui.js
//
(function(g, $) {
	var TICK = 80;
	var CELLSIZE = 15;

	var defaultOptions = {
		defaultMazeId: "default_maze"
	};

	var originalTitle = g.document.title;

	function MazeUI(options) {
		var mazeui = this;
		var maze;
		var stepCount;
		var stepTimer;
		var upstroke;

		options = $.extend({}, defaultOptions, options);

		function renderGrid() {
			var dimensions = maze.getDimensions();
			var table = $("<div>").css({
				margin: 0,
				padding: 0,
				width: dimensions.columns * CELLSIZE,
				height: dimensions.rows * CELLSIZE
			});
			for (var x = 0; x < dimensions.rows; ++x) {
				var row = $("<div>").attr("class", "tr").css({
					margin: 0,
					padding: 0,
					width: dimensions.columns * CELLSIZE,
					height: CELLSIZE
				});
				for (var y = 0; y < dimensions.columns; ++y) {
					var bgColor = "#eee";
					if (maze.isWall(x, y)) {
						bgColor = "#333";
					}
					else if (x == maze.startingPos.x && y == maze.startingPos.y) {
						bgColor = "#dfd";
					}
					var block = $("<div>").attr("class", "td").css({
						width: CELLSIZE,
						height: CELLSIZE,
						border: 0,
						float: "left",
						overflow: "none",
						padding: 0,
						margin: 0,
						textAlign: "center",
						fontSize: 10,
						color: "#ccc",
						backgroundColor: bgColor
					});
					row.append(block);
				}
				table.append(row);
			}
			mazeui.append(table);
		}

		function makeRobotDisplay(robot) {
			var robotChar;
			if (robot.facing.x) {
				robotChar = robot.facing.x < 0 ? "^" : "v";
			}
			else {
				robotChar = robot.facing.y < 0 ? "<" : ">";
			}
			return $("<span>").css({
				fontWeight: "bold",
				color: "red"
			}).text(robotChar);
		}

		function print(str) {
			mazeui.append($("<p>").attr("class", "notation").text(str));
		}

		function renderContents() {
			var rows = mazeui.find(".tr");
			var dimensions = maze.getDimensions();
			for (var x = 0; x < dimensions.rows; ++x) {
				var blocks = $(rows[x]).find(".td");
				for (var y = 0; y < dimensions.columns; ++y) {
					var block = $(blocks[y]);
					block.empty();
					if (maze.robot && maze.robot.pos.x == x && maze.robot.pos.y == y) {
						block.append(makeRobotDisplay(maze.robot));
					}
					else {
						var token = maze.getToken(x, y);
						if (token !== undefined) {
							block.text(token);
						}
					}
				}
			}
		}

		function go() {
			var robot = maze.robot;
			if (!robot || robot.status != Maze.ROBOT_OK) {
				return;
			}
			var dimensions = maze.getDimensions();
			var size = dimensions.rows * dimensions.columns;
			if (upstroke) {
				robot.move();
				renderContents();
			}
			else {
				robot.steer();
				++stepCount;
				renderContents();
			}
			if (!robot.inMaze()) {
				print("Escaped!");
			}
			else {
				switch (robot.status) {
				case Maze.ROBOT_OK:
					upstroke = !upstroke;
					stepTimer = g.setTimeout(go, TICK);
					break;
				case Maze.ROBOT_SMASHED:
					print("Smashed against the wall!");
					break;
				case Maze.ROBOT_ERROR:
					print("Unexpected error (see console).");
					break;
				case Maze.ROBOT_QUIT:
					print("Robot declares that there is no solution.");
					break;
				}
			}
		}

		function pause() {
			if (stepTimer) {
				g.clearTimeout(stepTimer);
				stepTimer = null;
			}
		}

		function kill() {
			pause();
			$(".notation").remove();
			maze.clearTokens();
			maze.robot = null;
		}

		function reset() {
			stepCount = 0;
			upstroke = false;
			renderContents();
		}

		function restart() {
			kill();
			if (maze.robot != null) {
				maze.resetRobot(robot);
			}
			reset();
		}

		function loadMaze(id) {
			var url = "maze/" + id;
			$.ajax(url, {
				method: "GET",
				dataType: "jsonp"
			})
			.success(function(data) {
				maze = Maze.parse(data);
				g.document.title = originalTitle + " - " + maze.title;
				mazeui.find(".mazeInfo")
					.append($("<div>")
						.css({
							"padding": 0,
							"margin": 0,
							"width": "50%",
							"float": "left" })
						.text(maze.title))
					.append($("<div>")
						.css({
							"padding": 0,
							"margin": 0,
							"width": "50%",
							"float": "left" })
						.text(maze.author));
				renderGrid();
				renderContents();
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				print("Error loading " + url + ": " + errorThrown);
			});
		}

		function makeSelect(list) {
			var select = $("<select>");
			for (var i = 0; i < list.length; ++i) {
				select.append($("<option>").attr("value", list[i]).text(list[i]));
			}
			return select;
		}

		function showLoadMazeForm() {
			kill();
			renderContents();
			$.ajax("/mazes", {
				method: "GET",
				dataType: "jsonp"
			})
			.success(function(data) {
				var select = makeSelect(data);
				$("#popup")
					.empty()
					.append($("<form>")
						.append($("<span>")
							.text("Pick one: "))
						.append(select.attr("name", "id"))
						.append($("<button>")
							.text("Load")
							.click(function() {
								$("#popup").find("form").submit();
								return false;
							}))
						.append($("<button>")
							.text("Cancel")
							.click(function(evt) {
								$("#popup").empty();
								return false;
							})));
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				print("Error loading /mazes: " + errorThrown);
			});
		}
		
		function createRobot(id) {
			var callbackName = ("cb_" + Math.random()).replace(/\./g, "");
			$[callbackName] = function(initFunc) {
				delete $[callbackName];
				var robot = maze.createRobot(initFunc);
				if (!robot.inMaze()) {
					print("Hey, there is no robot start position in this maze!");
					robot = null;
				}
				else {
					reset();
				}
			};
			var url = "/robot/" + id;
			$.ajax(url, {
				method: "GET",
				dataType: "script",
				data: {
					"callback": "jQuery." + callbackName
				}
			});
		}

		function showLoadRobotForm() {
			kill();
			renderContents();
			$.ajax("/robots", {
				method: "GET",
				dataType: "jsonp"
			})
			.success(function(data) {
				var select = makeSelect(data);
				$("#popup")
					.empty()
					.append($("<form>")
						.append($("<span>")
							.text("Pick a robot: "))
						.append(select)
						.append($("<button>")
							.text("Create")
							.click(function() {
								createRobot($("#popup select").val());
								$("#popup").empty();
								return false;
							}))
						.append($("<button>")
							.text("Cancel")
							.click(function(evt) {
								$("#popup").empty();
								return false;
							})));
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				print("Error loading /robots: " + errorThrown);
			});
		}

		// A menu, sorta.
		mazeui.append($("<div>")
			.append($("<button>")
				.text("Load Maze")
				.click(showLoadMazeForm))
			.append($("<button>")
				.text("Create Robot")
				.click(showLoadRobotForm))
			.append($("<button>")
				.text("Go")
				.click(go))
			.append($("<button>")
				.text("Pause")
				.click(pause))
			.append($("<button>")
				.text("Restart")
				.click(restart)));
		mazeui.append($("<div>")
			.attr("class", "mazeInfo")
			.css("margin", "10px 0"));

		// More of a "pop-in" than a "popup"
		mazeui.append($("<div>").attr("id", "popup").css({
			margin: 10
		}));

		(function() {
			var id = options.defaultMazeId;
			if (g.location.search) {
				var m = g.location.search.match(/[?&]id=([^&]+)/);
				if (m) {
					id = g.decodeURIComponent(m[1]);
				}
			}
			loadMaze(id);
		})();
	}

	$.fn.MazeUI = MazeUI;
})(this, this.jQuery);
