//
// mazeui.js
//
(function(g, $) {

	function MazeUI(options) {
		var mazeui = this;
		var maze = new Maze(options);
		var stepCount;
		var size;

		maze.registerChangeListener(function() {
			if (++stepCount > 3*size) {
				throw "That thing is running in circles.  Abort.";
			}
		});

		function run() {
			var robot = maze.getRobot();
			var controlModule = new ControlModule(robot);
			var dimensions = maze.getDimensions();
			size = dimensions.rows * dimensions.columns;
			stepCount = 0;
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
