# FullScreen.js [![Build Status](https://travis-ci.org/uupaa/FullScreen.js.svg)](https://travis-ci.org/uupaa/FullScreen.js)

[![npm](https://nodei.co/npm/uupaa.fullscreen.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.fullscreen.js/)

FullScreen API Wrapper.

This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/FullScreen.js/wiki/)
- [API Spec](https://github.com/uupaa/FullScreen.js/wiki/FullScreen)

## Browser, NW.js and Electron

```js
<style>
#content { width: 100%; height: 100%; background-color: skyblue; }
#trace { width: 100%; height: 100px; }
</style>

<div id="content">
<button onclick="_fullscreen()">FullScreen.request()</button> |
<button onclick="_toggle()">FullScreen.toggle()</button> |
<button onclick="_exit()">FullScreen.exit()</button> |
<button onclick="_release()">FullScreen.release()</button><br>
<output id="output"></output>
</div>

<script src="./lib/WebModule.js"></script>
<script src="./lib/FullScreen.js"></script>
<script>

var content = document.querySelector("#content");
var output = document.querySelector("#output");

window.onload = function() {
  if (FullScreen.enable) {
    FullScreen.on("fullscreenchange", _onfullscreenchange);
    FullScreen.on("fullscreenerror",  _onfullscreenerror);
    setTimeout(_tick, 1000);
  } else {
    output.innerHTML += "FullScreen API is not supported";
  }
}
function _onfullscreenchange(eventType, event) {
  console.info("FullScreen change event", eventType); // -> "fullscreenchange"
}
function _onfullscreenerror(eventType, event) {
  console.info("FullScreen error event", eventType); // -> "fullscreenerror"
}

function _release() {
  FullScreen.off("fullscreenchange", _onfullscreenchange);
  FullScreen.off("fullscreenerror",  _onfullscreenerror);
  FullScreen.release();
  output.innerHTML += "x";
}

function _tick() {
  setTimeout(_tick, 1000);

  if (FullScreen.enable) {
    if (FullScreen.isActive()) {
      output.innerHTML += "A";
      if (FullScreen.getActiveNode() !== content) {
        document.body.backgroundColor = "red";
      }
    } else {
      output.innerHTML += "-";
    }
  }
}
function _fullscreen() {
  if (FullScreen.enable) { FullScreen.request(content); }
}
function _toggle() {
  if (FullScreen.enable) { FullScreen.toggle(content); }
}
function _exit() {
  if (FullScreen.enable) { FullScreen.exit(); }
}
</script>
```


