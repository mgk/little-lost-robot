//
// mazeui.js
//
(function(g, $) {
	var TICK = 80;
	var CELLSIZE = 15;

	function MazeUI(options) {
		var mazeui = this;
		var maze = new Maze(options);
		var stepCount;
		var size;
		var robot;

		function renderGrid(maze) {
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
						backgroundColor: maze.whatsAt(x, y).blocked ? "#333" : "#eee"
					});
					row.append(block);
				}
				table.append(row);
			}
			mazeui.append(table);
		}

		function makeRobotDisplay(facing) {
			var robotChar;
			if (facing.x) {
				robotChar = facing.x < 0 ? "^" : "v";
			}
			else {
				robotChar = facing.y < 0 ? "<" : ">";
			}
			return $("<span>").css({
				fontWeight: "bold",
				color: "red"
			}).text(robotChar);
		}

		function print(str) {
			mazeui.append($("<p>").text(str));
		}

		function renderContents(maze) {
			var rows = mazeui.find(".tr");
			var dimensions = maze.getDimensions();
			for (var x = 0; x < dimensions.rows; ++x) {
				var blocks = $(rows[x]).find(".td");
				for (var y = 0; y < dimensions.columns; ++y) {
					var block = $(blocks[y]);
					block.empty();
					var stuff = maze.whatsAt(x, y);
					if (stuff.robot) {
						block.append(makeRobotDisplay(stuff.robot));
					}
					else if (stuff.token !== undefined) {
						block.text(stuff.token);
					}
				}
			}
		}

		function step(controlModule) {
			if (robot.status == Maze.ROBOT_OK) {
				if (!robot.inMaze()) {
					print("Escaped!");
				}
				else if (stepCount > 3*size) {
					print("That thing is running in circles.  Abort.");
				}
				else {
					//try {
						controlModule.step();
						++stepCount;
						renderContents(maze);
						if (robot.status == Maze.ROBOT_QUIT) {
							print("Robot declares that there is no solution.");
						}
						else {
							setTimeout(function() { stepUp(controlModule); }, TICK);
						}
						/***
					}
					catch (e) {
						print("Unexpected error (see console).");
						robot.status = Maze.ROBOT_SMASHED;
						console.log(e);
						return;
					}
					***/
				}
			}
		}

		function stepUp(controlModule)
		{
			robot.move();
			renderContents(maze);
			if (robot.status == Maze.ROBOT_SMASHED) {
				print("Smashed!  This ControlModule sucks!");
			}
			else {
				setTimeout(function() { step(controlModule); }, TICK);
			}
		}

		function go() {
			stepCount = 0;
			if (!robot.inMaze()) {
				print("Hey, there is no robot start position in this maze!");
			}
			else {
				step(new ControlModule(robot.getControls()));
			}
		}

		function handleLoad() {
			robot = maze.getRobot();
			var dimensions = maze.getDimensions();
			size = dimensions.rows * dimensions.columns;
			renderGrid(maze);
			renderContents(maze);
			mazeui.append($("<button>").text("GO").click(go));
		}

		function handleError() {
			mazeui.append($("<p>").text("error initializing " + maze.getTitle()));
		}

		mazeui.append($("<p>").text("loading " + maze.getTitle() + "...") );

		maze.load()
			.success(handleLoad)
			.error(handleError);
	}

	$.fn.MazeUI = MazeUI;
})(window, window.jQuery);
