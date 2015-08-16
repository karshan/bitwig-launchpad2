BUTTONS = {
  'UP':      {'type': 'CC', 'data1': 104},
  'DOWN':    {'type': 'CC', 'data1': 105},
  'LEFT':    {'type': 'CC', 'data1': 106},
  'RIGHT':   {'type': 'CC', 'data1': 107},
  'SESSION': {'type': 'CC', 'data1': 108},
  'USER1':   {'type': 'CC', 'data1': 109},
  'USER2':   {'type': 'CC', 'data1': 110},
  'MIXER':   {'type': 'CC', 'data1': 111},
}
CC_BUTTON_NAMES = {}
for (var button in BUTTONS) {
  if (BUTTONS.hasOwnProperty(button)) {
    cc_val = BUTTONS[button].data1;
    CC_BUTTON_NAMES[cc_val] = button;
  }
}

Launchpad = function(midiOut, midiIn) {
  var eventHandlers = []
  var out = host.getMidiOutPort(midiOut);

  host.getMidiInPort(midiIn).setMidiCallback(onMidiPort1.bind(this));

  function onMidiPort1(status, data1, data2) {
    if (isChannelController(status)) {
      handleCC(data1, data2);
    }
    else {
      handleNote(data1, data2);
    }
  }

  function handleCC(data1, data2) {
    if (data2 == 127) { // button down
      println(CC_BUTTON_NAMES[data1])
      if (data1 == 104) { // UP KEY
        out.sendMidi(146,88,81)
      }
      if (data1 == 105) { // DOWN KEY
        out.sendMidi(144,88,81)
      }
      if (data1 == 106) { // LEFT KEY
        out.sendMidi(145,88,81)
      }
      if (data1 == 107) { // RIGHT KEY
        out.sendMidi(144,88,80)
      }
    }
  }
  function handleNote(data1, data2) {
    out.sendMidi(144, data1, data2);
  }




}
