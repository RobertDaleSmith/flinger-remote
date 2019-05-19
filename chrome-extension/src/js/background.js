
/*         Developed by @RobertDaleSmith founder of @MoteLabs.           
           ____    ___  @FlingerCo / robert@motelabs.com
          /\  _`\ /\_ \    __                                                             
          \ \ \L\_\//\ \  /\_\    ___      __      __   _ __      ___    ___   
           \ \  _\/ \ \ \ \/\ \ /' _ `\  /'_ `\  /'__`\/\`'__\   /'___\ / __`\ 
            \ \ \/   \_\ \_\ \ \/\ \/\ \/\ \L\ \/\  __/\ \ \/ __/\ \__//\ \L\ \
             \ \_\   /\____\\ \_\ \_\ \_\ \____ \ \____\\ \_\/\_\ \____\ \____/
              \/_/   \/____/ \/_/\/_/\/_/\/___L\ \/____/ \/_/\/_/\/____/\/___/ 
                                           /\____/                             
                                           \_/__/                  (C)(TM)2013
*/

//Initialize global variables used primarily by the background pages.
var pageURl = window.location.href;
var docname;
var $state;
var sessionActive  = false;
var prevConnection = false;
var flingUrlFound  = false;
var queueUrlFound  = false;
var flingUrl = "";
var prevUrl = "";
var prevHasTag = "000000";
var currentVolume = 100;
var updateUIState = null;
var updateUIState2 = null;
var remoteName = "Remote" + viewerUid();
var uiPage = null;
var timeoutDialogBox = null;
var newUrl = "";
var YT_API_KEY = "AIzaSyCdzF0CeKuj-_G70SjcFmO62A7i1RNK_ao";

//Google analytics initialization stuff.
var _gaq = _gaq || [];
var gac = "UA-39500794-2";
if (pageURl.indexOf("chrome-extension") !== -1) gac = "UA-39500794-3";
_gaq.push(['_setAccount', gac]);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var savedRemoteName = localStorage.getItem('saved-remote-name');
if (savedRemoteName == null) {
    localStorage.setItem('saved-remote-name', remoteName);
} else {
    remoteName = savedRemoteName;
}

//Function user to fling a specified URL to the currently paired devices.
function flingURI(url) {

    newUrl = checkAndCleanUrl(url);

    if( youtube_parser(newUrl) != 0 )
        keyCodeToSend = "VIDEO_NEW_" + keyCodeUid();
    else
        keyCodeToSend = "URL_NEW_" + keyCodeUid();

    if (  !(newUrl.indexOf('http://') !== -1) && !(newUrl.indexOf('https://') !== -1)  )
        newUrl = "http://" + newUrl;
    $state.submitOp([{p:['url'],     od:null, oi:newUrl       },
                     {p:['keyCode'], od:null, oi:keyCodeToSend}]);


    sendAlert(url, "fling");

    if (pageURl.indexOf("chrome-extension") !== -1) { spinBrowserAction(); }
                       
};

function checkAndCleanUrl(url) { 

    //Check if Google search result and extract correct URL.
    if (url.indexOf("google.com") !== -1  && getUrlParam("url", url) != "") {
        var url = getUrlParam("url", url) + "";
        
        url = decodeAddress(url);
    }

    if (url.indexOf("google.com") !== -1  && getUrlParam("imgurl", url) != "") {
        var url = getUrlParam("imgurl", url) + "";
        
        url = decodeAddress(url);
    }

    return url;
}


//Function used for passing state update activity from background page to update UI.
function bgpStateUpdate() {

    if(updateUIState != null && sessionActive)
        updateUIState();
    if(updateUIState2 != null && sessionActive)
        updateUIState2();
    
    var remoteIndex = getRemoteIndex(remoteName);
    try {
        if (JSON.stringify($state.at('remotes').get()[remoteIndex].active) == 0) {
            $state.submitOp([{ p: ['remotes', remoteIndex, 'active'], od: 1, oi: 1}]);
        }
    }
    catch (e) { }


}

//Returns random eight digit number used to make every keycode sent unique.
function keyCodeUid() {
    return ("" + (Math.random() * Math.pow(36, 8) << 0)).substr(-8);
};

//Returns random four digit number used for generating unique user name for each device.
function viewerUid() {
    return ("" + (Math.random() * Math.pow(36, 4) << 0)).substr(-4);
};

//Opens or creates Flinger channel document for streaming communication between devices.
var openDocument = function (docName) {
    docname = docName;
    console.log("Connecting to " + docname);

    //local-testing:  http://localhost:36464/     //online-testing: http://flinger.cloudapp.net/
    sharejs.open(docname, 'json', 'https://flinger-co.herokuapp.com/channel', function (error, shareDocument) {
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


        if (shareDocument.created) {

            $state.submitOp([{ p: [], od: null, oi: { url: "", keyCode: "", volume: 100, seekTo: 0, checking: 0, screens: [], remotes: [{ name: remoteName, active: 1}], que: [], chat: []}}]);
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
            if (updateUIState != null)
                updateUIState();
            if (updateUIState2 != null)
                updateUIState2();

            //Connection successful
            console.log("Connected to " + docname);
            trackGAEvent("successful", "connect", docName);

            //LocalStorage
            //localSettings.values["connectedHash"] = docname;

            prevConnection = true;
            prevHasTag = docname;

            localStorage.setItem('saved-hash-id', docname);

            //console.log(flingUrlFound+"  "+flingUrl);

            if (flingUrlFound) {
                flingURI(flingUrl);
                flingUrlFound = false;                
            }
            if (queueUrlFound) {
                flingToQue(queueUrl);
                queueUrlFound = false;                
            }

        }

    });
};

//Checks a url if it is a valid YouTube url. If valid, then returns YouTube video ID, else returns 0.
function youtube_parser(url) {
    url = url.replace("player_embedded&v=", "watch?v=");

    if (url.indexOf("youtube.com") !== -1 && getUrlParam("v", url) != "") {
        url = "http://youtube.com/watch?v=" + getUrlParam("v", url);
    }
    

    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[7].length == 11) {

        return match[7];
    } else {
        //alert("Url incorrecta");
        return 0;
    }
}

//Checks a url if it is a valid Vimeo url. If valid, then returns Vimeo video ID, else returns 0.
function vimeo_parser(url) {
    url = url.replace("https://","http://");
    url = url.replace("vimeo.com/m/","vimeo.com/");
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

//Returns value of specified parameter found within a specified url.
function getUrlParam(param, url) {
    url = url.replace("feature=player_embedded&", "");
    param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
    var regex = new RegExp("[?&]" + param + "=([^&#]*)");
    url = url || decodeURIComponent(window.location.href);
    var match = regex.exec(url);
    return match ? match[1] : "";
}

//Initializes app back-end onload activities...
var initBackendOnload = function () {

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
                if(document.getElementById("hash_input")) 
                    document.getElementById("hash_input").value = docname;
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
                flingToQue(info.linkUrl);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "index.html?queue_url=" + info.linkUrl });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

            

        };
        var linkId = chrome.contextMenus.create({ "title": "Fling Link to Que", "contexts": ["link"], "onclick": linkOnClick });
        console.log("'" + "link" + "' item:" + linkId);


        // A page onclick callback function.
        var pageOnClick = function (info, tab) {
            console.log("item " + info.menuItemId + " was clicked");
            console.log("info: " + JSON.stringify(info));
            console.log("tab: " + JSON.stringify(tab));
            if (sessionActive) {
                newUrl = tab.url;
                flingToQue(tab.url);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "index.html?queue_url=" + tab.url });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var pageId = chrome.contextMenus.create({ "title": "Fling Page to Que", "contexts": ["page"], "onclick": pageOnClick });
        console.log("'" + "page" + "' item:" + pageId);



        // A image onclick callback function.
        var imageOnClick = function (info, tab) {
            console.log("item " + info.menuItemId + " was clicked");
            console.log("info: " + JSON.stringify(info));
            console.log("tab: " + JSON.stringify(tab));
            if (sessionActive) {
                newUrl = info.srcUrl;
                flingToQue(info.srcUrl);

                //sendGAEvent("Fling", "Link");
            }
            else {
                console.log("Fling was not sent because you are not paired to a Flinger channel.");
                chrome.tabs.create({ url: "index.html?queue_url=" + info.srcUrl });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var imageId = chrome.contextMenus.create({ "title": "Fling Image to Que", "contexts": ["image"], "onclick": imageOnClick });
        console.log("'" + "image" + "' item:" + imageId);


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
                chrome.tabs.create({ url: "index.html?fling_url=" + info.linkUrl });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };
        var linkId = chrome.contextMenus.create({ "title": "Fling Link to Play Now", "contexts": ["link"], "onclick": linkOnClick });
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
                chrome.tabs.create({ url: "index.html?fling_url=" + tab.url });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var pageId = chrome.contextMenus.create({ "title": "Fling Page to Play Now", "contexts": ["page"], "onclick": pageOnClick });
        console.log("'" + "page" + "' item:" + pageId);



        // A image onclick callback function.
        var imageOnClick = function (info, tab) {
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
                chrome.tabs.create({ url: "index.html?fling_url=" + info.linkUrl });
                //window.alert(notConnectedMessage);
                //TODO: Notify user no devices paired.
            }

        };

        var imageId = chrome.contextMenus.create({ "title": "Fling Image to Play Now", "contexts": ["image"], "onclick": imageOnClick });
        console.log("'" + "image" + "' item:" + imageId);
    }

    function getUrlParam(param, url) {
        url = url.replace("feature=player_embedded&", "");
        param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
        var regex = new RegExp("[?&]" + param + "=([^&#]*)");
        url = url || decodeURIComponent(window.location.href);
        var match = regex.exec(url);
        return match ? match[1] : "";
    }

    

    if (flingUrl.indexOf("youtube.com") !== -1 && getUrlParam("v", document.location.href) != "") {
        flingUrl = "http://youtube.com/watch?v=" + getUrlParam("v", document.location.href);
    }






}

//Returns the number of remote users connected.
var remoteCount = 0, remoteListCounted = false;
var remotesObject = [];

if (pageURl.indexOf("chrome-extension") !== -1) {

    var getRemoteCount = function() {
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
}
//Returns the index of remote user by name. Returns -1 if not found.
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
        console.log(remoteName + " was re-added to the list of viewers.  " + remotes);
        return remotes;
    }
    
    return foundIndex;
};

function getOnlyRemoteIndex(name) {
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
    return foundIndex;
}

// Called when the user clicks on the browser action.
if (pageURl.indexOf("chrome-extension") !== -1) {
    chrome.browserAction.onClicked.addListener(function (tab) {
        //Avaliable for future implementations.
    });
}



//Define event tracking functions fo Google Analytics 
function trackGAEvent(id,action,label) {
    _gaq.push(['_trackEvent', id, action, label]);
};
function trackButtonClick(e) {
    trackGAEvent('button', 'clicked', e.target.id);
};



//Set Chrome Extension Un-animated Canvas Icon
if (pageURl.indexOf("chrome-extension") !== -1) {
    
    var velocity = 1;
    
    function spinBrowserAction() {
        var i = 0;
        var loop = window.setInterval (function() {
          i++;
          chrome.browserAction.setIcon({imageData: draw(i)});
        }, 50);
        window.setTimeout(function () {
            window.clearInterval(loop);
            velocity = 1;
            
            chrome.browserAction.setIcon({imageData: draw(0)});
        }, 1825)
    }
    
    function draw(degrees) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var ctx2 = ctx;
        var angle = 0;
        var alpha = ctx.globalAlpha;
        
        ctx.translate(19 / 2, 19 / 2);
        ctx.rotate(degrees/velocity);
        velocity = velocity + .09;

        ctx.translate(-19 / 2, -19 / 2);

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
    chrome.browserAction.setIcon({ imageData: draw() });
}

//Handels multiple functions for onload event.
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}
addLoadEvent(initBackendOnload);

//Used for encoding and decoding URI addresses.
function encodeAddress() {
	var obj = document.getElementById('dencoder');
	var unencoded = obj.value;
	obj.value = encodeURIComponent(unencoded).replace(/'/g,"%27").replace(/"/g,"%22");	
}
function decodeAddress(uri) {
	var obj = uri;
	var encoded = obj;
	uri = decodeURIComponent(encoded.replace(/\+/g,  " "));
	return uri;
}

var flingToQue = function (url) {

    url = checkAndCleanUrl(url);

    var queObject;
    try {
        queObject = $state.at('que').get();
    } catch (e) {
        console.log("Warning: Que object not found.");
    }

    var queCount = queObject.length;
    var timeStamp = new Date().getTime();

    $state.submitOp([{ p: ['que', queCount], li: { url: url, time: timeStamp, username: remoteName}}]);

    sendAlert(url, "queue");

    if (pageURl.indexOf("chrome-extension") !== -1) { spinBrowserAction(); }

}

var removeFromQue = function (timeStamp) {

    var queObject;
    try {
        queObject = $state.at('que').get();
    } catch (e) {
        console.log("Warning: Que object not found.");
    }

    var queCount = queObject.length;


    for (var i = 0; i < queObject.length; i++) {

        if (queObject[i].time == timeStamp) {

            //console.log(timeStamp + " found!");
            $state.submitOp([{ p: ['que', i], ld: { url: queObject[i].url, time: queObject[i].time, username: queObject[i].username}}]);
            break;
        }
    }




}


//Message send action:
var sendAlertMessage = function (message, type) {
    message = message.replace(/(<([^>]+)>)/ig, "");
    var username = "alert_" + remoteName;

    if (type == "fling") {
        username = "ALERT_FLING_" + remoteName;
        message = "Fling`d " + message;
    } else if (type == "queue") {
        username = "ALERT_QUEUE_" + remoteName;
        message = "Queued " + message;
    }

    if (message != "") {
        var chatObject;
        try {
            chatObject = $state.at('chat').get();
        } catch (e) {
            console.log("Warning: Chat object not found.");
        }

        var timeStamp = new Date().getTime();

        $state.submitOp([{ p: ['chat', chatObject.length], li: { message: message, time: timeStamp, username: username}}]);

    }
}


var sendAlert = function (url, type) { 

    youtube_id = youtube_parser(url);

    vimeo_id = 0;
    if (url.indexOf("vimeo.com") !== -1) {
        vimeo_id = vimeo_parser(url);
    }

    if (youtube_id != 0) {
        //Is YouTube URL

        $.getJSON("https://www.googleapis.com/youtube/v3/videos?id=" + youtube_id + "&key=" + YT_API_KEY + "&part=snippet,statistics", function (info) {
            if (!(info && info.items && info.items.length)) return;

            var result = info.items[0];
            var snippet = result.snippet;
            var statistics = result.statistics;

            sendAlertMessage("\'" + snippet.title + "\' from YouTube", type);
        });

    } else if (url.indexOf("slideshare.net") !== -1) {

       
        //window["callback_" + queItemDiv.id] = slideShareCallback;

        //if (document.getElementById("videoData_" + queItemDiv.id))
        //    removeElement("videoData_" + queItemDiv.id);

        if (document.getElementById("videoData_ss"))
            removeElement("videoData_ss");

        var gdata = document.createElement("script");
        if(type == "fling")
            gdata.src = "https://www.slideshare.net/api/oembed/2?url=" + url + "&format=jsonp&callback=" + "ssFlingAlertCallback";
        else if(type == "queue")
            gdata.src = "https://www.slideshare.net/api/oembed/2?url=" + url + "&format=jsonp&callback=" + "ssQueueAlertCallback";
        gdata.id = "videoData_ss";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(gdata);

    } else if (vimeo_id != 0) {
        
        //window["callback_" + queItemDiv.id] = vimeoCallback;

        //if (document.getElementById("videoData_" + queItemDiv.id))
        //    removeElement("videoData_" + queItemDiv.id);

        if (document.getElementById("videoData_v"))
            removeElement("videoData_v");

        var gdata = document.createElement("script");
        if(type == "fling")
            gdata.src = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=vFlingAlertCallback";
        else if(type == "queue")
            gdata.src = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=vQueueAlertCallback";

        gdata.id = "videoData_v";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(gdata);

    } else {
        //Is Misc URL

        sendAlertMessage("\'" + url +"\'", type);
        

    }

}

function ssFlingAlertCallback(info) {
    sendAlertMessage("\'" + info.title + "\' from SlideShare", "fling");
            
};
function vFlingAlertCallback(info) {
    sendAlertMessage("\'" + info[0].title + "\' from Vimeo", "fling");
            
};
function ssQueueAlertCallback(info) {
    sendAlertMessage("\'" + info.title + "\' from SlideShare", "queue");
            
};
function vQueueAlertCallback(info) {
    sendAlertMessage("\'" + info[0].title + "\' from Vimeo", "queue");
            
};

if (pageURl.indexOf("chrome-extension") !== -1) {
    function removeElement(id) {
        var element = document.getElementById(id);
        element.parentNode.removeChild(element);
    }
}