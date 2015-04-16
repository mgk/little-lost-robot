(function(g, $) {
	var ControlModule = function(robot) {
		this.robot = robot;
	};
	ControlModule.prototype = {
		go: function() {
			var robot = this.robot;
			while (robot.inMaze()) {
				switch ((Math.random() * 4) >> 0) {
				case 0:
					robot.rotateLeft();
					break;
				case 1:
					robot.rotateRight();
					break;
				default:
					if (robot.lookAhead() !== false) {
						robot.move();
					}
				}
			}
		}
	};
	g.ControlModule = ControlModule;
})(window, window.jQuery);
