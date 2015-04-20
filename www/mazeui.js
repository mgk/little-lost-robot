//
// mazeui.js
//
(function(g, $) {
	var TICK = 100;

	function MazeUI(options) {
		var mazeui = this;
		var maze = new Maze(options);
		var stepCount;
		var size;
		var renderQueue = [];
		var lastRenderTime;
		var renderTimer;

		function renderGrid(maze) {
			var table = $("<table>").attr({
				cellpadding: 0,
				cellspacing: 0
			});
			var dimensions = maze.getDimensions();
			for (var x = 0; x < dimensions.rows; ++x) {
				var row = $("<tr>").css({
					border: "none"
				});
				for (var y = 0; y < dimensions.columns; ++y) {
					var block = $("<td>").css({
						width: "20px",
						height: "20px",
						border: 0,
						overflow: "none",
						padding: "2px",
						margin: 0,
						textAlign: "center",
						fontSize: "10px",
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

		function renderContents(maze) {
			var rows = mazeui.find("tr");
			var dimensions = maze.getDimensions();
			for (var x = 0; x < dimensions.rows; ++x) {
				var blocks = $(rows[x]).find("td");
				for (var y = 0; y < dimensions.columns; ++y) {
					var block = $(blocks[y]);
					block.empty();
					var stuff = maze.whatsAt(x, y);
					if (stuff.robot) {
						block.append(makeRobotDisplay(stuff.robot));
					}
					else if (stuff.token) {
						block.text(stuff.token);
					}
				}
			}
			lastRenderTime = new Date().getTime();
		}

		function scheduleNextRender() {
			renderTimer = setTimeout(renderNow, TICK);
		}

		function renderNow() {
			if (renderQueue.length) {
				renderContents(renderQueue.shift());
			}
			renderTimer = null;
			if (renderQueue.length) {
				scheduleNextRender();
			}
		}

		function triggerRender() {
			if (new Date().getTime() - lastRenderTime >= TICK) {
				renderContents(maze);
			}
			else {
				renderQueue.push(maze.copy());
				if (!renderTimer) {
					scheduleNextRender();
				}
			}
		}

		function go() {
			var robot = maze.getRobot();
			var controlModule = new ControlModule(robot);
			var results;
			stepCount = 0;
			try {
				controlModule.go();
				results = robot.inMaze() ? "Oh, well." : "Escaped!";
			}
			catch (e) {
				results = "Unexpected error (see console).";
				console.log(e);
			}
			mazeui.append($("<p>").text(results));
		}

		function handleLoad() {
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

		maze.registerChangeListener(function() {
			if (++stepCount > 3*size) {
				throw "That thing is running in circles.  Abort.";
			}
			triggerRender();
		});

		maze.load()
			.success(handleLoad)
			.error(handleError);
	}

	$.fn.MazeUI = MazeUI;
})(window, window.jQuery);
