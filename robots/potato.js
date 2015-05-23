function() {

  function getOffCouch(me) {
    var sleepy = 0;
    while (me.isFacingWall()) {
      if (sleepy++ > 10) {
        return me.quit();
      }
      me.rotate(1);
    }
    me.dropToken('C');
  }

  function lookForRemoteUmmIMeanExit(me) {
    if (me.isFacingWall()) {
      me.rotate(2);
      return false;
    }
    return true;
  }

  function returnToSafetyOfCouch(me) {
    if (me.tokenHere() === 'C') {
      me.rotate(2);
      return me.quit();
    }
    return true;
  }

  this.plan = [
    getOffCouch,
    lookForRemoteUmmIMeanExit,
    returnToSafetyOfCouch
  ];

  this.steer = function steer() {
    var step = this.plan.shift();
    if (!step) {
      quit();
    }
    else {
      if (step(this)) {
        this.plan.unshift(step);
      }
    }
  }

  this.title = 'Couch Potato';
  this.author = 'michael@keirnan.com';
  this.description =
    'Willing to look for remote but not stray out of sight of couch.';
}
