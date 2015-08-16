loadAPI(1);
host.defineController('Novation', 'Launchpad MK2', '1.0', '866741C5-F527-4787-8EE1-74E7BD44D974')
host.defineMidiPorts(1, 1);

load('util.js');
load('launchpad_base.js');

function init() {
  // userControls = host.createUserControlsSection(9);
  // upKey = userControls.getControl(0);
  // userControls.getControl(0).setLabel('UP');
  lp = new Launchpad(0, 0)

  lp.onButtonDown('UP', function(e) {
    println('up was pressed')
  })

  lp.onButtonDown(function(e) {
    println(e.button);
  })

  lp.useLaunchColumnAsNotes = false;
  lp.autoFlush = true;

  var t = 0;
  setInterval(function() {
    t += 0.2;
    var x = Math.floor(Math.sin(t)*3.3)+4;
    var y = Math.floor(Math.cos(t)*3.3)+4;
    var colors = lp.getBoardColors();

    colors[x + y * 10] = hslToRgb(Math.random(), 1,0.5)

    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];
      if (!color) continue;
      color[0] = Math.floor(color[0] * 0.92)
      color[1] = Math.floor(color[1] * 0.92)
      color[2] = Math.floor(color[2] * 0.92)
    }
    lp.setBoardColors(colors);
  }, 10)
  // lp.assignNote(0, 0, 'C4');


  // noteIn = host.getMidiInPort(0).createNoteInput("Notes");
}



function exit() {
  println("exit");
}
