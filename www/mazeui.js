//
// mazeui.js
//
(function(g, $) {

	function MazeUI(options) {
		var mazeui = this;
		var maze = new Maze(options);
		var stepCount;
		var size;

		function renderGrid() {
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
						width: "15px",
						height: "15px",
						border: 0,
						overflow: "none",
						padding: 0,
						margin: 0,
						backgroundColor: maze.whatsAt(x, y).blocked ? "#333" : "#eee"
					});
					row.append(block);
				}
				table.append(row);
			}
			mazeui.append(table);
		}

		function renderChange() {
			var rows = mazeui.find("tr");
			var dimensions = maze.getDimensions();
			for (var x = 0; x < dimensions.rows; ++x) {
				var blocks = $(rows[x]).find("td");
				for (var y = 0; y < dimensions.columns; ++y) {
					var block = $(blocks[y]);
					var stuff = maze.whatsAt(x, y);
					block.text(stuff.robot ? "R" : (stuff.token || ""));
				}
			}
		}

		maze.registerChangeListener(function() {
			if (++stepCount > 3*size) {
				throw "That thing is running in circles.  Abort.";
			}
			renderChange();
		});

		function run() {
			var robot = maze.getRobot();
			var controlModule = new ControlModule(robot);
			var dimensions = maze.getDimensions();
			size = dimensions.rows * dimensions.columns;
			stepCount = 0;
			renderGrid();
			try {
				controlModule.go();
				if (!robot.inMaze()) {
					mazeui.append($("<p>").text("Escaped!"));
				}
				else {
					mazeui.append($("<p>").text("Oh, well."));
				}
			}
			catch (e) {
				mazeui.append($("<p>").text("Unexpected error (see console)."));
				console.log(e);
			}
		}

		function handleError() {
			mazeui.append($("<p>").text("error initializing " + maze.getTitle()));
		}

		mazeui.append($("<p>").text("loading " + maze.getTitle() + "...") );
		maze.load()
			.success(run)
			.error(handleError);
	}

	$.fn.MazeUI = MazeUI;
})(window, window.jQuery);
