function initPanel() {
  gPanel = QuickSettings.create(60, 110, 'Sketch Parameter Range Helper');
  for (let s of settings) {
    gPanel.addRange(s.title, s.min, s.max, s.value, s.step, function (value) {});
  }

  gPanel
    .addButton('Randomize', randomize)
    .addButton('Copy Current Settings', copySettings)
    .addButton('Update Min Bounds', updateMin)
    .addButton('Update Max Bounds', updateMax)
    .addButton('Reset', resetPanel)
    .setGlobalChangeHandler(updateAll);
}

function updateAll() {
  updateDefault();
  createNewArt();
}

function updatePanel() {
  for (let s of settings) {
    gPanel.setRangeParameters(s.title, s.min, s.max, s.step);
  }
}
function updateMax() {
  for (let s of settings) {
    let val = gPanel.getValue(s.title);
    val = s.isInt ? int(val) : float(val);
    s.value = val;
    s.max = val;
  }
  updatePanel();
}

function updateMin() {
  for (let s of settings) {
    let val = gPanel.getValue(s.title);
    val = s.isInt ? int(val) : float(val);
    s.value = val;
    s.min = val;
  }
  updatePanel();
}

function randomize() {
  for (let s of settings) {
    s.value = random(s.min, s.max);
    gPanel.setValue(s.title, s.value);
  }
}

function updateDefault() {
  for (let s of settings) {
    let val = gPanel.getValue(s.title);
    s.value = s.isInt ? int(val) : float(val);
  }
}

function copySettings() {
  let stringSettings = 'let settings = ' + JSON.stringify(settings, null, 4);
  copyToClipboard(stringSettings);
}

function resetPanel() {
  settings = gOGSettings.map((obj) => deepCopy(obj));
  for (let s of settings) {
    gPanel.setValue(s.title, s.value);
  }
  updatePanel();
}

function getValue(settingName, isInt = false) {
  return isDebug ? getPanelValue(settingName, isInt) : getRandomValue(settingName, isInt);
}

function getPanelValue(settingName, isInt) {
  console.log(' ');
  console.log(settingName);
  if (isInt) console.log('int ' + int(gPanel.getValue(settingName)));
  else console.log('float ' + float(gPanel.getValue(settingName)));

  return isInt ? int(gPanel.getValue(settingName)) : float(gPanel.getValue(settingName));
}

function getRandomValue(settingName, isInt) {
  let s = settings.find((setting) => setting.title === settingName);
  let val = random(s.min, s.max);
  return isInt ? int(val) : float(val);
}

// I did not write this function, but copied it from Aaron Reuland (a_ soluble_fish) who copied it from user Greg Lowe on Stack Overflow

function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text);
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    var textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy'); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex);
      return prompt('Copy to clipboard: Ctrl+C, Enter', text);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// I did not write this function either, ChatGPT did it for me
function deepCopy(obj) {
  let newObj = {};
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = deepCopy(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
