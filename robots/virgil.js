function () {
	this.title = "Virgil";
	this.author = "Ech <ech@ech.net>";
	this.description = "A simple solution, but does it perform optimally?";
	this.steer = function() {
		var rem = this.tokenHere() || 4;
		while (this.dropToken(--rem) && rem > 0) {
			this.rotate(1);
			if (!this.isFacingWall() && this.tokenAhead() === undefined) {
				return;
			}
			this.rotate(2);
		}
		this.rotate(1);
		if (this.isFacingWall() || this.tokenAhead() == 0) {
			this.quit();
		}
	};
}
