//
// A fully functional sample robot, but not a successful one.
// This one does a random walk of the maze.
//
function() {
	var tokens = "ABCDEXYZ#&%+=*";

	function findTheWays(robot) {
		var ways = [];
		robot.rotate(-1);
		for (var i = 0; i < 4; ++i) {
			if (!robot.isFacingWall()) {
				ways.push(i);
			}
			robot.rotate(1);
		}
		return ways;
	}

	function rand(n) {
		return Math.floor(Math.random() * n);
	}

	function steer() {
		var ways = findTheWays(this);
		switch (ways.length) {
		case 0:
			this.quit();
			break;
		case 1:
			this.rotate(ways[0]);
			break;
		default:
			this.rotate(ways[rand(ways.length - 1)]);
		}
		this.dropToken(tokens.charAt(rand(tokens.length)));
	}

	this.title = "Random";
	this.author = "The Goblin King";
	this.description = "Warning: it's crazy";
	this.steer = steer;
}
