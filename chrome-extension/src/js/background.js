var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-39500794-3']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var pageURl = window.location.href;

var docname;
var $state;
var sessionActive  = false;
var prevConnection = false;
var flingUrlFound  = false;
var flingUrl = "";
var prevUrl = "";
var prevHasTag = "000000";
var currentVolume = 100;
var stateUpdated = null;
var remoteName = "";
var uiPage = null;

function keyCodeUid() {
    return ("" + (Math.random() * Math.pow(36, 8) << 0)).substr(-8);
};
function viewerUid() {
    return ("" + (Math.random() * Math.pow(36, 4) << 0)).substr(-4);
};

var newUrl = "";

function flingURI(url) {

    newUrl = url;

    if( youtube_parser(newUrl) != 0 )
        keyCodeToSend = "VIDEO_NEW_" + keyCodeUid();
    else
        keyCodeToSend = "URL_NEW_" + keyCodeUid();

    if (  !(newUrl.indexOf('http://') !== -1) && !(newUrl.indexOf('https://') !== -1)  )
        newUrl = "http://" + newUrl;
    $state.submitOp([{p:['url'],     od:null, oi:newUrl       },
                     {p:['keyCode'], od:null, oi:keyCodeToSend}]);
                   
};

function bgpStateUpdate() {

    if(stateUpdated != null && sessionActive)
        stateUpdated();
   

    var remoteIndex = getRemoteIndex(remoteName);
    try {
        if (JSON.stringify($state.at('remotes').get()[remoteIndex].active) == 0) {
            $state.submitOp([{ p: ['remotes', remoteIndex, 'active'], od: 1, oi: 1}]);
        }
    }
    catch (e) { }


}

var timeoutDialogBox = null;

var openDocument = function (docName) {
    docname = docName;
    console.log("Connecting to " + docname);

    //local-testing:  http://localhost:36464/     //online-testing: http://flinger.cloudapp.net/
    sharejs.open(docname, 'json', 'http://flinger.cloudapp.net/channel', function (error, shareDocument) {
        $state = shareDocument;

        shareDocument.on('change', function (op) {

            //console.log(JSON.stringify(op));

            bgpStateUpdate();

        });

        shareDocument.on('closed', function () {

            console.log("Connection Lost or Document Closed.");
            sessionActive = false;
            if (pageURl.indexOf("chrome-extension") !== -1) {
                document.location.reload(true);
                if (uiPage != null) { 
                    if (timeoutDialogBox != null) {
                        timeoutDialogBox.style.display = "block";
                    }
                }
            } else {
                //var s = document.location.href;
                //var n = s.indexOf('?');
                //s = s.substring(0, n != -1 ? n : s.length);
                //n = s.indexOf('#');
                //s = s.substring(0, n != -1 ? n : s.length);

                //window.open(s, "_self");

                if (timeoutDialogBox != null) {
                    timeoutDialogBox.style.display = "block";
                }
            }
            localStorage.removeItem('saved-hash-id');

            

        });

        remoteName = "Remote" + viewerUid();
        if (shareDocument.created) {

            $state.submitOp([{ p: [], od: null, oi: { url: "", keyCode: "", volume: 100, seekTo: 0, checking: 0, screens: [], remotes: [{ name: remoteName, active: 1}]}}]);
            console.log("Document" + " " + docname + " " + "Created!");

        } else {
            $state.submitOp([{ p: ['remotes', getRemoteCount()], li: { name: remoteName, active: 1}}]);
            console.log("Document" + " " + docname + " " + "Opened!");

        }

        if (error) {
            sessionActive = false;
            data.content = error;
            console.log("Connecting error " + error);

        } else {
            sessionActive = true;
            $('#data').text(JSON.stringify($state.snapshot));
            if (stateUpdated != null)
                stateUpdated();

            //Connection successful
            console.log("Connected to " + docname);
            trackGAEvent("successful","connect",docName);

            //LocalStorage
            //localSettings.values["connectedHash"] = docname;

            prevConnection = true;
            prevHasTag = docname;

            localStorage.setItem('saved-hash-id', docname);


            if (flingUrlFound) {

                document.getElementById('addressBarTextArea').value = flingUrl;
                flingURI(flingUrl);
                flingUrlFound = false;
            }

        }

    });
};

function youtube_parser(url) {
    url = url.replace("player_embedded&v=", "watch?v=");
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[7].length == 11) {

        return match[7];
    } else {
        //alert("Url incorrecta");
        return 0;
    }
}

function vimeo_parser(url) {
    url = url.replace("https://","http://");
    url = url.replace("channels/staffpicks/","");
    var regExp = /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;
    var match = url.match(regExp);
    if (match) {
        //console.log(match[2]);
        return (match[2]);
    } else {
        //console.log(0);
        return 0;
    };
}

function getUrlParam(param, url) {
    url = url.replace("feature=player_embedded&", "");
    param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
    var regex = new RegExp("[?&]" + param + "=([^&#]*)");
    url = url || decodeURIComponent(window.location.href);
    var match = regex.exec(url);
    return match ? match[1] : "";
}

window.onload = function () {

    var savedHashId = localStorage.getItem('saved-hash-id');
    if (savedHashId != null && !sessionActive) {
        docname = savedHashId;
        prevHasTag = savedHashId;
        prevConnection = true;
        
        
        console.log('Restored hash id: #' + docname);
    }

    if (prevConnection) {
        if (pageURl.indexOf("chrome-extension") !== -1) {
            openDocument(prevHasTag);
        } else { 
            if (!document.location.hash) {
                document.getElementById("hashtag_input").value = docname;
                connectToHash();
            }
        }
    }

    var notConnectedMessage = "Fling was not sent because you are not paired to a Flinger channel.";

    if (pageURl.indexOf("chrome-extension") !== -1) {
        chrome.contextMenus.removeAll();

        // A link onclick callback function.
        var linkOnClick = function (info, tab) {
            console.log("item " + info.menuItemId + " was clicked");
            console.log("info: " + JSON.stringify(info));
            console.log("tab: " + JSON.stringify(tab));
            if (sessionActive) {
                newUrl = info.linkUrl;
                flingURI(info.linkUrl);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "options.html" });
                window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };
        var linkId = chrome.contextMenus.create({ "title": "Fling Link to Flinger.co", "contexts": ["link"], "onclick": linkOnClick });
        console.log("'" + "link" + "' item:" + linkId);


        // A page onclick callback function.
        var pageOnClick = function (info, tab) {
            console.log("item " + info.menuItemId + " was clicked");
            console.log("info: " + JSON.stringify(info));
            console.log("tab: " + JSON.stringify(tab));
            if (sessionActive) {
                newUrl = tab.url;
                flingURI(tab.url);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "options.html" });
                window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var pageId = chrome.contextMenus.create({ "title": "Fling Page to Flinger.co", "contexts": ["page"], "onclick": pageOnClick });
        console.log("'" + "page" + "' item:" + pageId);



        // A image onclick callback function.
        var imageOnClick = function (info, tab) {
            console.log("item " + info.menuItemId + " was clicked");
            console.log("info: " + JSON.stringify(info));
            console.log("tab: " + JSON.stringify(tab));
            if (sessionActive) {
                newUrl = info.srcUrl;
                flingURI(info.srcUrl);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "options.html" });
                window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var imageId = chrome.contextMenus.create({ "title": "Fling Image to Flinger.co", "contexts": ["image"], "onclick": imageOnClick });
        console.log("'" + "image" + "' item:" + imageId);
    }

    function getUrlParam(param, url) {
        url = url.replace("feature=player_embedded&","");
        param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
        var regex = new RegExp("[?&]" + param + "=([^&#]*)");
        url = url || decodeURIComponent(window.location.href);
        var match = regex.exec(url);
        return match ? match[1] : "";
    }

    flingUrl = getUrlParam("fling_url", document.location.href);
    if (flingUrl != "") {
        console.log("Fling URL found in href: " + flingUrl);
        flingUrlFound = true;
    }

    if (flingUrl.indexOf("youtube.com") !== -1 && getUrlParam("v", document.location.href) != "") {
        flingUrl = "http://youtube.com/watch?v=" + getUrlParam("v", document.location.href);
    }



    
    

}


var remoteCount = 0, remoteListCounted = false;
var remotesObject = [];
function getRemoteCount() {
    remoteCount = 0; remoteListCounted = false;

    try {
        remotesObject = $state.at('remotes').get();
    } catch (e) {
        console.log("Warning: Remotes object not found.");
    }

    remoteCount = remotesObject.length;
    //console.log(remoteCount);
    return remoteCount;
};

function getRemoteIndex(name) {
    foundIndex = -1;
    var remotes = getRemoteCount();
    for (var i = 0; i < remotes; i++) {
        try {
            if (JSON.stringify($state.at('remotes').get()[i].name).indexOf("\"" + name + "\"") !== -1) {
                foundIndex = i;
                break;
            }
        }
        catch (e) { }
    }

    if (foundIndex == -1 && remoteName != "") {
        $state.submitOp([{ p: ['remotes', remotes], li: { name: remoteName, active: 1}}]);
        console.log(viewerName + " was re-added to the list of viewers.  " + remotes);
        return remotes;
    }
    
    return foundIndex;
};

// Called when the user clicks on the browser action.
if (pageURl.indexOf("chrome-extension") !== -1) {
    chrome.browserAction.onClicked.addListener(function (tab) {
        //var action_url = "options.html"; // + encodeURIComponent(tab.href) + '&title=' + encodeURIComponent(tab.title);
        //chrome.tabs.create({ url: action_url });
    });
}

function trackGAEvent(id,action,label) {
    _gaq.push(['_trackEvent', id, action, label]);
};

function trackButtonClick(e) {
    trackGAEvent('button', 'clicked', e.target.id);
};


var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var ctx2 = ctx;
var angle = 0;

function draw() {
    
    var alpha = ctx.globalAlpha;

      // layer1/Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(14.9, 9.4);
      ctx.bezierCurveTo(14.9, 9.4, 9.4, 12.5, 9.1, 12.7);
      ctx.bezierCurveTo(8.8, 12.9, 8.0, 13.5, 8.3, 14.1);
      ctx.bezierCurveTo(8.7, 14.7, 9.7, 14.4, 10.2, 14.1);
      ctx.bezierCurveTo(10.7, 13.9, 16.8, 11.1, 17.3, 10.9);
      ctx.bezierCurveTo(17.7, 10.6, 18.7, 10.0, 18.9, 9.1);
      ctx.bezierCurveTo(19.1, 8.2, 18.6, 7.3, 18.5, 7.1);
      ctx.bezierCurveTo(18.4, 7.0, 14.5, 0.9, 14.2, 0.6);
      ctx.bezierCurveTo(14.0, 0.3, 13.7, -0.2, 13.2, 0.1);
      ctx.bezierCurveTo(12.7, 0.3, 13.0, 0.9, 13.0, 1.2);
      ctx.bezierCurveTo(13.1, 1.4, 15.6, 6.9, 15.7, 7.1);
      ctx.bezierCurveTo(15.8, 7.4, 16.3, 8.6, 14.9, 9.4);
      ctx.fillStyle = "rgb(240, 94, 97)";
      ctx.fill();

      // layer1/Group
      ctx.globalAlpha = alpha * 0.50;

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(14.6, 9.6);
      ctx.lineTo(14.7, 9.6);
      ctx.lineTo(14.7, 9.5);
      ctx.lineTo(14.6, 9.5);
      ctx.lineTo(14.6, 9.6);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(14.7, 9.5);
      ctx.bezierCurveTo(14.7, 9.5, 14.7, 9.5, 14.6, 9.6);
      ctx.bezierCurveTo(14.7, 9.5, 14.7, 9.5, 14.7, 9.5);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(14.4, 9.7);
      ctx.lineTo(14.5, 9.7);
      ctx.lineTo(14.5, 9.6);
      ctx.lineTo(14.4, 9.6);
      ctx.lineTo(14.4, 9.7);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(14.4, 9.7);
      ctx.bezierCurveTo(14.5, 9.7, 14.5, 9.6, 14.5, 9.6);
      ctx.bezierCurveTo(14.5, 9.6, 14.5, 9.7, 14.4, 9.7);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(14.6, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(14.6, 9.6);
      ctx.bezierCurveTo(14.6, 9.6, 14.6, 9.6, 14.6, 9.6);
      ctx.bezierCurveTo(14.6, 9.6, 14.6, 9.6, 14.6, 9.6);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(14.5, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.lineTo(14.6, 9.6);
      ctx.lineTo(14.5, 9.6);
      ctx.lineTo(14.5, 9.6);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(14.5, 9.6);
      ctx.bezierCurveTo(14.5, 9.6, 14.6, 9.6, 14.6, 9.6);
      ctx.bezierCurveTo(14.6, 9.6, 14.5, 9.6, 14.5, 9.6);
      ctx.fill();

      // layer1/Path
      ctx.restore();
      ctx.restore();
      ctx.globalAlpha = alpha * 1.00;
      ctx.beginPath();
      ctx.moveTo(7.5, 5.1);
      ctx.bezierCurveTo(7.5, 5.1, 13.0, 8.2, 13.3, 8.4);
      ctx.bezierCurveTo(13.6, 8.6, 14.5, 9.0, 14.8, 8.4);
      ctx.bezierCurveTo(15.2, 7.8, 14.4, 7.1, 14.0, 6.8);
      ctx.bezierCurveTo(13.5, 6.4, 8.0, 2.5, 7.6, 2.2);
      ctx.bezierCurveTo(7.2, 2.0, 6.1, 1.4, 5.2, 1.8);
      ctx.bezierCurveTo(4.4, 2.1, 3.9, 2.9, 3.8, 3.1);
      ctx.bezierCurveTo(3.6, 3.3, 0.4, 9.7, 0.2, 10.0);
      ctx.bezierCurveTo(0.0, 10.4, -0.2, 10.9, 0.3, 11.2);
      ctx.bezierCurveTo(0.7, 11.5, 1.2, 11.0, 1.3, 10.8);
      ctx.bezierCurveTo(1.4, 10.6, 5.0, 5.7, 5.1, 5.5);
      ctx.bezierCurveTo(5.3, 5.3, 6.1, 4.2, 7.5, 5.1);
      ctx.fill();

      // layer1/Group
      ctx.globalAlpha = alpha * 0.50;

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.6, 5.2);
      ctx.lineTo(7.7, 5.2);
      ctx.lineTo(7.7, 5.1);
      ctx.lineTo(7.6, 5.1);
      ctx.lineTo(7.6, 5.2);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.6, 5.1);
      ctx.bezierCurveTo(7.6, 5.1, 7.7, 5.2, 7.7, 5.2);
      ctx.bezierCurveTo(7.7, 5.2, 7.6, 5.1, 7.6, 5.1);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.8, 5.3);
      ctx.lineTo(7.9, 5.3);
      ctx.lineTo(7.9, 5.2);
      ctx.lineTo(7.8, 5.2);
      ctx.lineTo(7.8, 5.3);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.9, 5.3);
      ctx.bezierCurveTo(7.9, 5.3, 7.9, 5.3, 7.8, 5.2);
      ctx.bezierCurveTo(7.9, 5.3, 7.9, 5.3, 7.9, 5.3);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.7, 5.2);
      ctx.lineTo(7.7, 5.2);
      ctx.lineTo(7.7, 5.2);
      ctx.lineTo(7.7, 5.2);
      ctx.lineTo(7.7, 5.2);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.7, 5.2);
      ctx.bezierCurveTo(7.7, 5.2, 7.7, 5.2, 7.7, 5.2);
      ctx.bezierCurveTo(7.7, 5.2, 7.7, 5.2, 7.7, 5.2);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.8, 5.2);
      ctx.lineTo(7.8, 5.2);
      ctx.lineTo(7.8, 5.2);
      ctx.lineTo(7.8, 5.2);
      ctx.lineTo(7.8, 5.2);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.8, 5.2);
      ctx.bezierCurveTo(7.8, 5.2, 7.8, 5.2, 7.8, 5.2);
      ctx.bezierCurveTo(7.8, 5.2, 7.8, 5.2, 7.8, 5.2);
      ctx.fill();

      // layer1/Path
      ctx.restore();
      ctx.restore();
      ctx.globalAlpha = alpha * 1.00;
      ctx.beginPath();
      ctx.moveTo(7.4, 13.7);
      ctx.bezierCurveTo(7.4, 13.7, 7.4, 7.4, 7.4, 7.0);
      ctx.bezierCurveTo(7.4, 6.7, 7.3, 5.7, 6.6, 5.7);
      ctx.bezierCurveTo(5.9, 5.7, 5.7, 6.7, 5.6, 7.3);
      ctx.bezierCurveTo(5.5, 7.8, 5.0, 14.5, 4.9, 15.1);
      ctx.bezierCurveTo(4.9, 15.6, 5.0, 16.7, 5.7, 17.3);
      ctx.bezierCurveTo(6.4, 17.9, 7.4, 17.9, 7.6, 17.9);
      ctx.bezierCurveTo(7.8, 18.0, 15.0, 17.6, 15.4, 17.5);
      ctx.bezierCurveTo(15.7, 17.5, 16.3, 17.4, 16.3, 16.9);
      ctx.bezierCurveTo(16.4, 16.4, 15.7, 16.3, 15.5, 16.2);
      ctx.bezierCurveTo(15.2, 16.2, 9.3, 15.6, 9.0, 15.5);
      ctx.bezierCurveTo(8.7, 15.5, 7.4, 15.3, 7.4, 13.7);
      ctx.fill();

      // layer1/Group
      ctx.globalAlpha = alpha * 0.50;

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.4, 13.5);
      ctx.lineTo(7.4, 13.5);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.5);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.4, 13.5);
      ctx.bezierCurveTo(7.4, 13.4, 7.4, 13.4, 7.4, 13.3);
      ctx.bezierCurveTo(7.4, 13.4, 7.4, 13.4, 7.4, 13.5);
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.4, 13.2);
      ctx.lineTo(7.4, 13.2);
      ctx.lineTo(7.4, 13.1);
      ctx.lineTo(7.4, 13.2);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.4, 13.1);
      ctx.lineTo(7.4, 13.2);
      ctx.lineTo(7.4, 13.1);
      ctx.closePath();
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.closePath();
      ctx.fill();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Group
      ctx.save();
      ctx.globalAlpha = alpha * 1.00;

      // layer1/Group/Group/Clipping Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.closePath();
      ctx.clip();

      // layer1/Group/Group/Path
      ctx.beginPath();
      ctx.moveTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.lineTo(7.4, 13.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.restore();

      
        
      return ctx.getImageData(0, 0, 19, 19);
}
chrome.browserAction.setIcon({imageData: draw()});

