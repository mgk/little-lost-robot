(function(g) {
	var ControlModule = function(robot) {
		this.robot = robot;
	};
	ControlModule.prototype = {
		step: function() {
			var robot = this.robot;
			if (robot.tokenHere() === undefined) {
				robot.dropToken(3);
			}
			while (robot.tokenHere() > 0) {
				robot.dropToken(robot.tokenHere() - 1);
				robot.rotate(1);
				if (!robot.isFacingWall() && robot.tokenAhead() === undefined) {
					return;
				}
				robot.rotate(2);
			}
			robot.dropToken("X");
			robot.rotate(1);
			if (robot.isFacingWall() || robot.tokenAhead() == "X") {
				robot.quit();
			}
		}
	};
	g.ControlModule = ControlModule;
})(window);
