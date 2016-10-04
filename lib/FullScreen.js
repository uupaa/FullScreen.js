(function moduleExporter(moduleName, moduleClosure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](moduleName, moduleClosure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("FullScreen", function moduleClosure(global, WebModule, VERIFY, VERBOSE) {
"use strict";

// --- technical terms / data structure --------------------
// --- dependency modules ----------------------------------
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
var FULLSCREEN_APIS = {
    "stable":   { "request": "requestFullscreen",       "exit": "exitFullscreen",       "active": "fullscreenElement"       },
    "webkit":   { "request": "webkitRequestFullscreen", "exit": "webkitExitFullscreen", "active": "webkitFullscreenElement" },
    "moz":      { "request": "mozRequestFullScreen",    "exit": "mozCancelFullScreen",  "active": "mozFullScreenElement"    },
    "ms":       { "request": "msRequestFullscreen",     "exit": "msExitFullscreen",     "active": "msFullscreenElement"     },
};
var FULLSCREEN_EVENTS = {
    "stable":   { "fullscreenchange": "fullscreenchange",       "fullscreenerror": "fullscreenerror"       },
    "webkit":   { "fullscreenchange": "webkitfullscreenchange", "fullscreenerror": "webkitfullscreenerror" },
    "moz":      { "fullscreenchange": "mozfullscreenchange",    "fullscreenerror": "mozfullscreenerror"    },
    "ms":       { "fullscreenchange": "MSFullscreenChange",     "fullscreenerror": "MSFullscreenError"     },
};
var _vendor    = _detectVendor();   // "stable", "webkit", "moz", "ms"
var _enable    = !!_vendor;         // enable full screen mode.
var _callbacks = {                  // callback function array. [callback, ...]
    "fullscreenchange": [],
    "fullscreenerror":  [],
};
// --- class / interfaces ----------------------------------
var FullScreen = {
    "enable":           _enable,
    "release":          FullScreen_release,         // FullScreen.release():void
    "on":               FullScreen_on,              // FullScreen.on(type:String, callback:Function):void
    "off":              FullScreen_off,             // FullScreen.off(type:String, callback:Function):void
    "request":          FullScreen_request,         // FullScreen.request(node:Node):Promise|null
    "toggle":           FullScreen_toggle,          // FullScreen.toggle(node:Node):void
    "exit":             FullScreen_exit,            // FullScreen.exit():Promise|null
    "isActive":         FullScreen_isActive,        // FullScreen.isActive():Boolean
    "getActiveNode":    FullScreen_getActiveNode,   // FullScreen.getActiveNode():Boolean
    "repository":       "https://github.com/uupaa/FullScreen.js",
};
// --- implements ------------------------------------------
function _detectVendor() { // @ret String
    var document = global["document"] || {};

    var vendor = document["fullscreenEnabled"]       ? "stable"
               : document["webkitFullscreenEnabled"] ? "webkit"
               : document["mozFullScreenEnabled"]    ? "moz"
               : document["msFullscreenEnabled"]     ? "ms" : "";
    if (vendor) {
        document["addEventListener"](FULLSCREEN_EVENTS[vendor]["fullscreenchange"], _handleEvent); // fullscreenchange
        document["addEventListener"](FULLSCREEN_EVENTS[vendor]["fullscreenerror"],  _handleEvent); // fullscreenerror
    }
    return vendor;
}

function _handleEvent(event) { // @arg Event
    var type = event.type === FULLSCREEN_EVENTS[_vendor]["fullscreenchange"] ? "fullscreenchange"
             : event.type === FULLSCREEN_EVENTS[_vendor]["fullscreenerror"]  ? "fullscreenerror"
                                                                             : "";
    if (type) {
        if (VERBOSE) { console.info(event.type); }
        for (var i = 0, iz = _callbacks[type].length; i < iz; ++i) {
            if (_callbacks[type][i]) {
                _callbacks[type][i](type, event);
            }
        }
    }
}

function FullScreen_release() { // @desc cleanup, release all events and event listeners.
    _callbacks = {
        "fullscreenchange": [],
        "fullscreenerror":  [],
    };
    if (_vendor) {
        FullScreen["enable"] = false;
        document["removeEventListener"](FULLSCREEN_EVENTS[_vendor]["fullscreenchange"], _handleEvent);
        document["removeEventListener"](FULLSCREEN_EVENTS[_vendor]["fullscreenerror"],  _handleEvent);
    }
}

function FullScreen_on(type,       // @arg String - "fullscreenchange" or "fullscreenerror"
                       callback) { // @arg Function - callback(eventType:String, event:Event):void
                                   // @desc attach FullScreen event.
//{@dev
    if (VERIFY) {
        $valid($type(type,     "String"),       FullScreen_on, "type");
        $valid($some(type,     "fullscreenchange|fullscreenerror"), FullScreen_on, "type");
        $valid($type(callback, "Function"),     FullScreen_on, "callback");
    }
//}@dev

    var pos = _callbacks[type].indexOf(callback); // find registered callback

    if (pos < 0) { // already -> ignore
        _callbacks[type].push(callback);
    }
}

function FullScreen_off(type,       // @arg String - "fullscreenchange" or "fullscreenerror"
                        callback) { // @arg Function - registered function by FullScreen.on
                                    // @desc detach FullScreen event.
//{@dev
    if (VERIFY) {
        $valid($type(type,     "String"),       FullScreen_off, "type");
        $valid($some(type,     "fullscreenchange|fullscreenerror"), FullScreen_off, "type");
        $valid($type(callback, "Function"),     FullScreen_off, "callback");
    }
//}@dev

    var pos = _callbacks[type].indexOf(callback); // find registered callback

    if (pos >= 0) {
        _callbacks[type].splice(pos, 1);
    }
}

function FullScreen_request(node) { // @arg Node
                                    // @ret Promise|null
    var api = FULLSCREEN_APIS[_vendor]["request"];

    return node[api]() || null;
}

function FullScreen_toggle(node) { // @arg Node
                                   // @ret Promise|null
    return FullScreen_isActive(node) ? FullScreen_exit()
                                     : FullScreen_request(node);
}

function FullScreen_exit() { // @ret Promise|null
    var api = FULLSCREEN_APIS[_vendor]["exit"];

    return document[api]() || null;
}

function FullScreen_isActive() { // @ret Boolean
    var api = FULLSCREEN_APIS[_vendor]["active"];

    return !!document[api];
}

function FullScreen_getActiveNode() { // @ret Node
    var api = FULLSCREEN_APIS[_vendor]["active"];

    return document[api] || null;
}

return FullScreen; // return entity

});

