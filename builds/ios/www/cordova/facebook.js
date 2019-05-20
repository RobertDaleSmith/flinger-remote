/*
	Facebook Plug-in
*/

cordova.define("cordova/plugin/facebook",
  function(require, exports, module) {
    var exec = require("cordova/exec");
    var Facebook = function () {};
    
    Facebook.prototype.isFacebookAvailable = function( success, failure ) {
        if (typeof failure != "function")  {
            console.log("Facebook.scan failure: failure parameter not a function");
            return
        }

        if (typeof success != "function") {
            console.log("Facebook.scan failure: success callback parameter must be a function");
            return
        }
        cordova.exec(success, failure, "Facebook", "isFacebookAvailable", []);
    };
    
    Facebook.prototype.sharePicker = function( success, failure, wallPostText, options) {
        if (typeof failure != "function")  {
            console.log("Facebook.scan failure: failure parameter not a function");
            return
        }

        if (typeof success != "function") {
            console.log("Facebook.scan failure: success callback parameter must be a function");
            return
        }
        cordova.exec(success, failure, "Facebook", "sharePicker", [wallPostText]);
    };
    

    Facebook.prototype.composeWallPost = function( success, failure, wallPostText, options) {
        if (typeof failure != "function")  {
            console.log("Facebook.scan failure: failure parameter not a function");
            return
        }

        if (typeof success != "function") {
            console.log("Facebook.scan failure: success callback parameter must be a function");
            return
        }
        cordova.exec(success, failure, "Facebook", "composeWallPost", [wallPostText]);
    };

    var facebook = new Facebook();
    module.exports = facebook;
});

if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.facebook) {
    window.plugins.facebook = cordova.require("cordova/plugin/facebook");
}