loadAPI(1);
host.defineController('Novation', 'Launchpad MK2', '1.0', '866741C5-F527-4787-8EE1-74E7BD44D974')
host.defineMidiPorts(1, 1);

load('util.js');
load('launchpad_base.js');
load('launchpad_session_view.js');
load('launchpad_user_view.js');
load('launchpad_rainbow_view.js');

function init() {

  lp = new Launchpad(0, 0, {
    useLaunchColumnAsNotes: false,
    autoFlush: true
  });

  sessionView = new SessionView(lp);
  user1View = new User1View(lp);
  rainbowsView = new RainbowView(lp, 'USER2');

  lp.setView(sessionView);

  // lp.onButtonDown(function(e) {
  //   println(e.button);
  // })

}



function exit() {
  println("exit");
}
