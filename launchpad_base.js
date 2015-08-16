BUTTONS = {
  'UP':      {'type': 'CC', 'data1': 104},
  'DOWN':    {'type': 'CC', 'data1': 105},
  'LEFT':    {'type': 'CC', 'data1': 106},
  'RIGHT':   {'type': 'CC', 'data1': 107},
  'SESSION': {'type': 'CC', 'data1': 108},
  'USER1':   {'type': 'CC', 'data1': 109},
  'USER2':   {'type': 'CC', 'data1': 110},
  'MIXER':   {'type': 'CC', 'data1': 111},
  'VOL':     {'type': 'NOTE', 'data1': 89},
  'PAN':     {'type': 'NOTE', 'data1': 79},
  'SENDA':   {'type': 'NOTE', 'data1': 69},
  'SENDB':   {'type': 'NOTE', 'data1': 59},
  'STOP':    {'type': 'NOTE', 'data1': 49},
  'MUTE':    {'type': 'NOTE', 'data1': 39},
  'SOLO':    {'type': 'NOTE', 'data1': 29},
  'ARM':     {'type': 'NOTE', 'data1': 19}
}
BUTTON_NAMES = {}
for (var button in BUTTONS) {
  cc_val = BUTTONS[button].data1;
  BUTTON_NAMES[cc_val] = button;
}
NOTE_BUTTON_NAMES = {}
for (var button in BUTTONS) {
  if (!BUTTONS[button].type == 'NOTE') continue;
  note = BUTTONS[button].data1;
  NOTE_BUTTON_NAMES[note] = button;
}

Launchpad = function(midiOut, midiIn) {
  var eventHandlers = {};
  var boardColors = [];
  var lastFlushedColors = [];
  var needsFlush = true;
  var out = host.getMidiOutPort(midiOut);
  var _this = this;
  host.getMidiInPort(midiIn).setMidiCallback(handleMidi.bind(this));

  setInterval(function() {if (_this.autoFlush) flushBoardColors()}, 10);

  function flushBoardColors() {
    if (!needsFlush) return;
    needsFlush = false;
    var sysexMessage = 'F000202902180B';
    for (var i = 0; i <= 39; i++) {
      if (NOTE_BUTTON_NAMES[i+11] && !_this.useLaunchColumnAsNotes) continue;
      var colorHex = (boardColors[i] || Launchpad.OFF).toHex();
      if (lastFlushedColors[i] == colorHex) continue;
      lastFlushedColors[i] = colorHex;
      sysexMessage += (i+11).toHex() + colorHex;
    }
    sysexMessage += 'F7';
    out.sendSysex(sysexMessage);

    var sysexMessage = 'F000202902180B';
    for (var i = 40; i <= 78; i++) {
      if (NOTE_BUTTON_NAMES[i+11] && !_this.useLaunchColumnAsNotes) continue;
      var colorHex = (boardColors[i] || Launchpad.OFF).toHex();
      if (lastFlushedColors[i] == colorHex) continue;
      lastFlushedColors[i] = colorHex;
      sysexMessage += (i+11).toHex() + colorHex;
    }
    sysexMessage += 'F7';
    out.sendSysex(sysexMessage);
  }



  function handleMidi(status, data1, data2) {
    if (isChannelController(status)) {
      handleCC(data1, data2);
    }
    else {
      if (NOTE_BUTTON_NAMES[data1] && !this.useLaunchColumnAsNotes) {
        handleCC(data1,data2);
      }
      else {
        handleNote(data1, data2);
      }
    }
  }

  function handleCC(data1, data2) {
    var buttonName = BUTTON_NAMES[data1];
    if (data2 == 127) { // button down

      if (!eventHandlers['buttonDown']) return;
      for (var i = 0; i < eventHandlers['buttonDown'].length; i++) {
        var handler = eventHandlers['buttonDown'][i];
        var eventData = {button: buttonName};
        if (handler.filter == buttonName || !handler.filter) {
          handler.cb(eventData)
        }
      }
    }
  }

  function handleNote(data1, data2) {

    //out.sendMidi(144, data1, data2);

    println(data1)
  }

  ///// PUBLIC
  // Properties
  this.useLaunchColumnAsNotes = false;
  this.autoFlush = false;

  // Methods
  this.flush = function() {
    flushBoardColors();
  }

  this.buttonOn = function() {

  }
  this.lightGrid = function() {
    out.sendMidi(144,88,81)
  }
  this.blinkGrid = function() {
    out.sendMidi(145,88,81)
  }
  this.pulseGrid = function() {
    out.sendMidi(146,88,81)
  }

  this.on = function(event, filterOrCb, cb) {
    var filter;
    if (cb) filter = filterOrCb;
    else {
      filter = false;
      cb = filterOrCb;
    }
    if (!eventHandlers[event]) eventHandlers[event] = []
    eventHandlers[event].push({filter: filter, cb: cb.bind(this)});
  }

  this.setColor = function(x, y, color) {
    boardColors[x + y * 10] = color;
    needsFlush = true;
  }

  this.onButtonDown = function(buttonOrCb, cb) {
    this.on('buttonDown', buttonOrCb, cb);
  }

  this.clearBoard = function() {
    boardColors = [];
    //out.sendSysex('F000202902180E00F7');
  }

  this.getBoardColors = function() {
    return boardColors;
  }

  this.setBoardColors = function(colors) {
    boardColors = colors;
    needsFlush = true;
  }

}

Launchpad.WHITE = [63,63,63]
Launchpad.OFF =   [0,0,0]
