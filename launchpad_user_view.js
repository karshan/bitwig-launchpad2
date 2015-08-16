function User1View(launchpad) {
  var lp = launchpad;
  var active = false;
  var view = this;

  lp.onButtonDown('USER1', function() {
    lp.setView(view);
  })

  this.onShow = function() {
    active = true;
    host.showPopupNotification('User 1')
    lp.setButtonColor('USER1', Launchpad.color('WHITE'));
  }

  this.onHide = function() {
    active = false;
    lp.setButtonColor('USER1', Launchpad.color('OFF'));
  }

}
