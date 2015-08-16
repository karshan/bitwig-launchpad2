function SessionView(launchpad) {
  var lp = launchpad;
  var active = false;
  var view = this;

  lp.onButtonDown('SESSION', function() {
    lp.setView(view);
  })

  this.onShow = function() {
    active = true;
    host.showPopupNotification('Session')
    lp.setButtonColor('SESSION', Launchpad.color('WHITE'));
  }

  this.onHide = function() {
    active = false;
    // lp.setButtonColor('SESSION', Launchpad.color('OFF'));
  }

}
