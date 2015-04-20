function() {

    // Here is the steering function.  Replace the contents of this function
	// with your own solution.
	this.steer = function() {
		// Count the # of times this square has been visited.
		this.dropToken((this.tokenHere() || 0) + 1);

		// Try straight, left, right, and back the way we came, in that order.
		for (var i = 0; i < 3 && this.isFacingWall(); ++i) {
			this.rotate([ -1, 2, 1 ][i]);
		}

		// Don't let the robot get stuck in a loop.
		if (this.tokenAhead() > 20) {
			this.quit();
		}
	};

	// You may also set title, author, and description for this guidance system.
	// this.title = "Untitled";
	// this.author = "you";
	// this.description = "";
}
