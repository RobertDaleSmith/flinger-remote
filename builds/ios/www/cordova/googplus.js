/*
	Googplus Plug-in
*/

cordova.define("cordova/plugin/googplus",
  function(require, exports, module) {
    var exec = require("cordova/exec");
    var Googplus = function () {};
    
    Googplus.prototype.isGoogplusAvailable = function( success, failure ) {
        if (typeof failure != "function")  {
            console.log("Googplus.scan failure: failure parameter not a function");
            return
        }

        if (typeof success != "function") {
            console.log("Googplus.scan failure: success callback parameter must be a function");
            return
        }
        cordova.exec(success, failure, "Googplus", "isGoogplusAvailable", []);
    };

    Googplus.prototype.composeWallPost = function( success, failure, wallPostText, options) {
        if (typeof failure != "function")  {
            console.log("Googplus.scan failure: failure parameter not a function");
            return
        }

        if (typeof success != "function") {
            console.log("Googplus.scan failure: success callback parameter must be a function");
            return
        }
        cordova.exec(success, failure, "Googplus", "composeWallPost", [wallPostText]);
    };

    var googplus = new Googplus();
    module.exports = googplus;
});

if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.googplus) {
    window.plugins.googplus = cordova.require("cordova/plugin/googplus");
}