loadAPI(1);
host.defineController('Novation', 'Launchpad MK2', '1.0', '866741C5-F527-4787-8EE1-74E7BD44D974')
host.defineMidiPorts(1, 1);

load('util.js');
load('launchpad_base.js');

var LAUNCHPAD;

function init() {
  // userControls = host.createUserControlsSection(9);
  // upKey = userControls.getControl(0);
  // userControls.getControl(0).setLabel('UP');
  LAUNCHPAD = new Launchpad(0, 0)
  // noteIn = host.getMidiInPort(0).createNoteInput("Notes");
}



function exit() {
  println("exit");
}
