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
  createLines();
}

function updatePanel() {
  for (let s of settings) {
    gPanel.setRangeParameters(s.title, s.min, s.max, s.step);
  }
}

function updateMax() {
  for (let s of settings) {
    let val = int(gPanel.getValue(s.title));
    s.value = val;
    s.max = val;
  }
  updatePanel();
}

function updateMin() {
  for (let s of settings) {
    let val = int(gPanel.getValue(s.title));
    s.value = val;
    s.min = val;
  }
  updatePanel();
}

function randomize() {
  for (let s of settings) {
    s.value = floor(random(s.min, s.max));
    gPanel.setValue(s.title, s.value);
  }
}

function updateDefault() {
  for (let s of settings) {
    s.value = int(gPanel.getValue(s.title));
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
