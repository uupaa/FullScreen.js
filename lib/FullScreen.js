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
    "fullscreenchange": [],         // [{ fn, remain, removed }, ...]
    "fullscreenerror":  [],         // [{ fn, remain, removed }, ...]
};
// --- class / interfaces ----------------------------------
var FullScreen = {
    "enable":           _enable,
    "release":          FullScreen_release,         // FullScreen.release():void
    "on":               FullScreen_on,              // FullScreen.on(type:String, callback:Function):void
    "once":             FullScreen_once,            // FullScreen.once(type:String, callback:Function):void
    "many":             FullScreen_many,            // FullScreen.many(type:String, callback:Function, remain:UINT16):void
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
            var item = _callbacks[type][i]; // { fn, remain, removed }
            if (item) {
                if (item.removed) {
                    // skip item
                } else if (item.remain === Infinity) {
                    item.fn(type, event);
                } else if (item.remain > 0) {
                    item.remain--;
                    item.fn(type, event);
                    if (item.remain <= 0) {
                        item.removed = true;
                    }
                } else { // if (item.remain <= 0) {}
                    item.removed = true;
                }
            }
        }
        _removeItem(type);
    }
}

function _indexOf(type, callback) {
    for (var i = 0, iz = _callbacks[type].length; i < iz; ++i) {
        if (_callbacks[type][i].fn === callback) {
            return i;
        }
    }
    return -1;
}

function _removeItem(type) {
    var newArray = [];

    for (var i = 0, iz = _callbacks[type].length; i < iz; ++i) {
        var item = _callbacks[type][i]; // { fn, remain, removed }
        if (item.removed) {
            // skip
        } else {
            newArray.push(item);
        }
    }
    _callbacks[type] = newArray; // overwrite
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

    var pos = _indexOf(type, callback); // find registered callback

    if (pos < 0) { // not found -> append
        _callbacks[type].push({ fn: callback, remain: Infinity, removed: false });
    }
}

function FullScreen_once(type,       // @arg String - "fullscreenchange" or "fullscreenerror"
                         callback) { // @arg Function - callback(eventType:String, event:Event):void
                                     // @desc attach FullScreen event just once.
//{@dev
    if (VERIFY) {
        $valid($type(type,     "String"),       FullScreen_once, "type");
        $valid($some(type,     "fullscreenchange|fullscreenerror"), FullScreen_once, "type");
        $valid($type(callback, "Function"),     FullScreen_once, "callback");
    }
//}@dev

    var pos = _indexOf(type, callback); // find registered callback

    if (pos < 0) { // not found -> append
        _callbacks[type].push({ fn: callback, remain: 1, removed: false });
    }
}

function FullScreen_many(type,     // @arg String - "fullscreenchange" or "fullscreenerror"
                         callback, // @arg Function - callback(eventType:String, event:Event):void
                         remain) { // @arg UINT16 - remain count
                                   // @desc attach FullScreen event just once.
//{@dev
    if (VERIFY) {
        $valid($type(type,     "String"),       FullScreen_many, "type");
        $valid($some(type,     "fullscreenchange|fullscreenerror"), FullScreen_many, "type");
        $valid($type(callback, "Function"),     FullScreen_many, "callback");
        $valid($type(remain,   "UINT16"),       FullScreen_many, "remain");
        $valid(remain >= 1,                     FullScreen_many, "remain");
    }
//}@dev

    var pos = _indexOf(type, callback); // find registered callback

    if (pos < 0) { // not found -> append
        _callbacks[type].push({ fn: callback, remain: remain, removed: false });
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

    var pos = _indexOf(type, callback); // find registered callback

    if (pos >= 0) { // already exists
        _callbacks[type][pos].removed = true; // mark
        _removeItem(type);
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

