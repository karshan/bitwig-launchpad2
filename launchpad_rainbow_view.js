function RainbowView(launchpad, button) {
  var lp = launchpad;
  var active = false;
  var view = this;

  this.onShow = function() {
    active = true;
    host.showPopupNotification('PRETTY LIGHTS!')
    lp.setButtonColor(button, Launchpad.color('WHITE'));
  }

  this.onHide = function() {
    active = false;
    lp.setButtonColor(button, Launchpad.color('OFF'));
  }

  lp.onButtonDown(button, function() {
    lp.setView(view);
  })

  var t = 0;
  setInterval(function() {
    if (!active) return;

    t += 0.2;
    var x = Math.floor(Math.sin(t)*3.3)+4;
    var y = Math.floor(Math.cos(t)*3.3)+4;
    var colors = lp.getBoardColors();

    colors[x + y * 10] = hslToRgb(Math.random(), 1,0.5)

    for (var i = 0; i < 90; i++) {
      var color = colors[i];
      if (!color) continue;
      color[0] = Math.floor(color[0] * 0.92)
      color[1] = Math.floor(color[1] * 0.92)
      color[2] = Math.floor(color[2] * 0.92)
    }
    lp.setBoardColors(colors);
  }, 1)
}
