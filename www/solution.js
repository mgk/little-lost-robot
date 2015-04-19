(function(g, $) {
	var ControlModule = function(robot) {
		this.robot = robot;
	};
	ControlModule.prototype = {
		go: function() {
			var robot = this.robot;
			while (robot.inMaze()) {
                switch (robot.getToken()) {
                case undefined:
                    robot.dropToken("1");
                    break;
                case "1":
                    robot.dropToken("2");
                    robot.rotateLeft();
                    break;
                case "2":
                    robot.dropToken("3");
                    robot.rotateRight();
                    break;
                case "3":
                    robot.dropToken("X");
                    robot.rotateRight();
                    robot.rotateRight();
                    break;
                }
                if (robot.lookAhead() && robot.lookAhead().token == null) {
                    robot.move();
                    go();
                    if (!robot.inMaze()) {
                        break;
                    }
                    robot.rotateLeft();
                    robot.rotateLeft();
                    robot.move();
                    switch (robot.getToken()) {
                    case "1":
                        robot.rotateLeft();
                        robot.rotateLeft();
                        break;
                    case "2":
                        robot.rotateLeft();
                        break;
                    case "3":
                        robot.rotateRight();
                        break;
                    case "X":
                        return;
                    }
                }
			}
		}
	};
	g.ControlModule = ControlModule;
})(window, window.jQuery);
