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

var NUM_TRACKS = 8;
var NUM_SENDS = 0;
var NUM_SCENES = 8;

function mkColor(red, green, blue) {
  return [red * 63, green * 63, blue * 63].map(Math.floor);
}

Launchpad = function(midiOut, midiIn, options) {
  var eventHandlers = {};
  var activeView = null;
  var boardColors = [];
  var lastFlushedColors = [];
  var needsFlush = true;

  var clips = []

  var out = host.getMidiOutPort(midiOut);
  var trackBank = host.createMainTrackBank(NUM_TRACKS, NUM_SENDS, NUM_SCENES);

  for (var i = 0; i < NUM_TRACKS; i++) {
    clips[i] = [];
    for (var j = 0; j < NUM_SCENES; j++) {
      clips[i][j] = {};
    }

    var clipLauncherSlots = trackBank.getTrack(i).getClipLauncher();
    clipLauncherSlots.addColorObserver(colorObserver(i).bind(this));
    clipLauncherSlots.addIsPlayingObserver(isPlayingObserver(i).bind(this));
  }

  host.getMidiInPort(midiIn).setMidiCallback(handleMidi.bind(this));

  setInterval(function() {if (options.autoFlush) flushDevice()}, 25);

  function isPlayingObserver(track) {
    return function(slot, isPlaying) {
      println("isPlaying: " + track + " " + slot + " " + isPlaying)
      clips[track][slot].isPlaying = isPlaying;
      if (isPlaying) {
        this.setGridColor(slot, NUM_TRACKS - track - 1, mkColor(1, 1, 1));
      } else {
        this.setGridColor(slot, NUM_TRACKS - track - 1, clips[track][slot].color);
      }
    }
  }

  function colorObserver(track) {
    return function(slot, red, green, blue) {
      clips[track][slot].color = mkColor(red, green, blue);
      this.setGridColor(slot, NUM_TRACKS - track - 1, clips[track][slot].color);
    };
  }

  function flushDevice() {
    if (!needsFlush) return;
    needsFlush = false;

    var ranges = [[0,49], [50,90], [93,100]];
    for (var req = 0; req < ranges.length; req++) {
      var sysexMessage = 'F000202902180B';
      var range = ranges[req];
      for (var i = range[0]; i <= range[1]; i++) {
        var colorHex = boardColors[i] ? boardColors[i].toHex() : '000000';
        if (lastFlushedColors[i] === colorHex) continue;
        lastFlushedColors[i] = colorHex;
        sysexMessage += (i+11).toHex() + colorHex;

      }
      sysexMessage += 'F7';
      out.sendSysex(sysexMessage);
    }
    // println(lastFlushedColors)

  }


  function handleMidi(status, data1, data2) {
    if (isChannelController(status)) {
      handleCC(data1, data2);
      // out.sendMidi(status,data1,data2)
    }
    else {
      if (NOTE_BUTTON_NAMES[data1] && !options.useLaunchColumnAsNotes) {
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
    var row = (Math.floor(data1/10)) % 10
    var col = data1 % 10;
    trackBank.getTrack(8 - row).getClipLauncher().launch(col - 1);
    //out.sendMidi(144, data1, data2);

    // println(data1)
  }

  ///// PUBLIC
  // Properties
  this.useLaunchColumnAsNotes = false;
  this.autoFlush = false;

  // Methods
  this.flush = function() {
    flushDevice();
  }

  this.setButtonColor = function(button, color) {
    boardColors[BUTTONS[button].data1-11] = color;
    needsFlush = true;
  }
  this.setGridColor = function(x, y, color) {
    println("setting grid color: " + x + " " + y + " " + color)
    boardColors[x + y * 10] = color;
    needsFlush = true;
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

  this.onButtonDown = function(buttonOrCb, cb) {
    this.on('buttonDown', buttonOrCb, cb);
  }

  this.clearDevice = function() {
    boardColors = [];
  }

  this.getBoardColors = function() {
    return boardColors;
  }

  this.setBoardColors = function(colors) {
    boardColors = colors;
    needsFlush = true;
  }

  this.setView = function(view) {
    this.clearDevice();
    if (activeView) activeView.onHide();
    activeView = view;
    view.onShow();
  }

}

Launchpad.color = function(colorName) {
  var colors = {
    'WHITE': [63,63,63],
    'OFF': [0,0,0],
    'RED': [63,0,0]}
  return colors[colorName].slice(0);
}
