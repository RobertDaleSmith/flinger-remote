var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-39500794-3']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

makeMainResponsive();
var pageURl = window.location.href;
var BGP = null;

if(pageURl.indexOf("chrome-extension") !== -1)
    BGP = chrome.extension.getBackgroundPage();
else
    BGP = window;

var sessionActive = BGP.sessionActive;
var volumeMute = false;
var prevVolume = 0;



var element = document.createElement('textarea');
element.id = 'data';
document.body.appendChild(element);


console.log("Hey! -Felix")


var data = document.getElementById("data");

if (document.location.hash && !sessionActive) {
    BGP.docname = document.location.hash.substring(1, 7); // Enter Hashkey - the user's file
    document.getElementById("hashtag_input").value = BGP.docname;
    connectToHash();
}


function uid() {
    return ("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).substr(-6);
};
function keyCodeUid() {
    return ("" + (Math.random() * Math.pow(36, 8) << 0)).substr(-8);
};


var timeOutCounter = 0;
var timeOutTimer;

function connectToHash() {

    BGP.docname = document.getElementById("hashtag_input").value;


    if (BGP.docname.length != 6) {
        //Input validation. Must be 6 alphanumeric characters or shake and error displayed.
        document.getElementById('intro_error_label').style.display = 'block';
 
    }
    else {
        document.getElementById('intro_error_label').style.display = 'none';
        document.getElementById('disconnect_button').style.display = 'block';
        document.getElementById('loaderImage').style.display = 'block';

        document.getElementById('hashtag_input').disabled = 'true';

        BGP.docname = BGP.docname.toLowerCase();
        document.getElementById("hashtag_input").value = BGP.docname;

        document.location.hash = BGP.docname;
        console.log("Tryin to open " + BGP.docname);
        
        
        BGP.openDocument(BGP.docname);
        

        //timer keeps checking for connection positive
        timeOutCounter = 0;
        timeOutTimer = setInterval(function () { checkConnection() }, 250);
        function checkConnection() {
            console.log(BGP.prevConnection);
            if (BGP.prevConnection == true) {
                connectionSuccess();
                //stateUpdated();
                clearInterval(timeOutTimer);
            }
            else
                timeOutCounter += 250;

            if(timeOutCounter >= 15,000) {

                alert("Connection Timed Out... Check connection and try again.");
                disconnectFromHash();
            }
                
        }
        
        


    }


};

function connectionSuccess() {
    sessionActive = true;
    console.log("Connected to " + BGP.docname);
    document.getElementById('loaderImage').style.display = 'none';
    document.getElementById('intro_paired_not_box').style.display = 'none';
    document.getElementById('intro_paired_yes_box').style.display = 'block';

    document.getElementById('control_container').style.display = 'block';

    document.getElementById('channel_info_container').style.display = 'block';
    //WinJS.UI.Animation.enterPage(control_container);

    document.getElementById('paired_Title').innerHTML = "Paired to #" + BGP.docname;

    document.getElementById('intro_tv_url').innerHTML = "http://flinger.co/#" + BGP.docname;
    document.getElementById('intro_tv_url').href = "http://flinger.co/#" + BGP.docname;

    document.getElementById('channel_info_url').innerHTML = "http://flinger.co/#" + BGP.docname;
    document.getElementById('channel_info_url').href = "http://flinger.co/#" + BGP.docname;

    document.getElementById('channel_info_hash').innerHTML = BGP.docname;

    document.getElementById("hashtag_input").value = BGP.docname;
        document.getElementById('intro_error_label').style.display = 'none';
        document.getElementById('disconnect_button').style.display = 'block';
        document.getElementById('hashtag_input').disabled = 'true';
    // Attaching the ShareJS file to the editor
    //shareDocument.attach_textarea(data);
    stateUpdated();
    BGP.stateUpdated = stateUpdated;

    if (pageURl.indexOf("chrome-extension") !== -1) {
        document.getElementById('body').style.width =  670 + "px";
        document.getElementById('body').style.height = 570 + "px";        
    }


    if (BGP.docname == "0debug" || BGP.docname == "robert") {
        document.getElementById('data').style.display = "block";
    } else {
        document.getElementById('data').style.display = "none";
    }

};


function disconnectFromHash() {
    sessionActive = false;
    console.log("Disconnecting from " + BGP.prevHasTag);
    document.getElementById('hashtag_input').disabled = 'false';
    document.getElementById('loaderImage').style.display = 'block';

    //WinJS.UI.Animation.exitPage(control_container);

    
    console.log("Disconnected from " + BGP.prevHasTag);
    document.getElementById('loaderImage').style.display = 'none';
    document.getElementById('disconnect_button').style.display = 'none';

    document.getElementById('loaderImage').style.display = 'none';
    document.getElementById('intro_paired_not_box').style.display = 'block';
    document.getElementById('intro_paired_yes_box').style.display = 'none';

    $("#hashtag_input").removeAttr("disabled");
    
    BGP.$state.close(function(position, text) {console.log("Document Closed!")});

    //localSettings.values.remove("connectedHash");

    document.location.hash = "";

    //document.location.reload(true);
    var s = document.location.href;
    var n = s.indexOf('?');
    s = s.substring(0, n != -1 ? n : s.length);
    n = s.indexOf('#');
    s = s.substring(0, n != -1 ? n : s.length);

    window.open(s,"_self");

    BGP.prevConnection = false;

    //localSettings.values["recentDisconnect"] = true;


    document.getElementById("hashtag_input").value = "";
    BGP.sessionActive = false;

    localStorage.removeItem('saved-hash-id');
    
    if(pageURl.indexOf("chrome-extension") !== -1)
        BGP.document.location.reload(true);

};

function getUrlParam(param, url) {
    url = url.replace("feature=player_embedded&","");
    param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
    var regex = new RegExp("[?&]" + param + "=([^&#]*)");
    url = url || decodeURIComponent(window.location.href);
    var match = regex.exec(url);
    return match ? match[1] : "";
}

var currentUrl = "", url = "";
var textArea = document.getElementById("data");
var textAreaPrevText = textArea.value;
var prevousTime = 0;
var ytEnabled = false, slidesEnabled = false, ytPlayerEnabled = false, vimeoPlayerEnabled = false;

var completedWidth, currentTime, totalTime, currentHours, currentMinutes, currentSeconds, durationHours, durationMinutes, durationSeconds;
var playerState = -1, newPlayerState, currentTimeOutput, durationTimeOutput, seekBarWidth;

var video_id = 0, vimeo_id = 0;

function stateUpdated() {
    
    try {
        url = BGP.$state.at('url').get();
    } catch(e){}
    BGP.prevUrl = url;

    if (currentUrl != url) {
        document.getElementById('addressBarTextArea').value = url;
        
        //if (url.indexOf("youtube.com") !== -1 && getUrlParam("v", url).indexOf("") !== -1 && BGP.youtube_parser(url) != 0) {
        //    url = "http://youtube.com/watch?v=" + getUrlParam("v", url);
        //}

        video_id = BGP.youtube_parser(url);

        vimeo_id = 0;
        if (url.indexOf("vimeo.com") !== -1) {
            vimeo_id = BGP.vimeo_parser(url);
        }

        if (video_id != 0) {
            //Is YouTube URL
            loadInfo(video_id);

            document.getElementById("video_info_container").style.display = "block";
            document.getElementById("slide_controls").style.display = "none";
            
            ytEnabled = true;
            ytPlayerEnabled = true;
            slidesEnabled = false;
            vimeoPlayerEnabled = false;

            document.getElementById("adblock_iframe").src = "http://flinger.co/ad/?fling_url=" + url.replace("http://","").replace("https://","");

        } else if (url.indexOf("slideshare.net") !== -1) {
            //Is SlideShare URL
            loadSlideInfo(url);
            
            document.getElementById("video_info_container").style.display = "block";
            document.getElementById("slide_controls").style.display = "block";
            
            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = true;
            vimeoPlayerEnabled = false;

        } else if (vimeo_id != 0) {

            loadVimeoInfo(vimeo_id);

            document.getElementById("video_info_container").style.display = "block";
            document.getElementById("slide_controls").style.display = "none";

            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = false;
            vimeoPlayerEnabled = true;

            


        } else {
            //Is Misc URL
            
            document.getElementById("video_info_container").style.display = "none";
            document.getElementById("slide_controls").style.display = "none";

            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = false;
            vimeoPlayerEnabled = false;
        }


    }
    currentUrl = url;


    try {
        BGP.currentVolume = BGP.$state.at('volume').get();
    } catch (e) { }

    if (prevVolume != BGP.currentVolume)
    {
        completedWidth = ( ( BGP.currentVolume * 88 ) / 100 );
        if (completedWidth > 100) completedWidth = 100;
        document.getElementById("volumeSlider").getElementsByClassName('complete')[0].style.width = completedWidth + "px";
        document.getElementById("volumeSlider").getElementsByClassName('marker')[0].style.left = completedWidth + "px";
        
    }

    try {
        $('#data').text(JSON.stringify(BGP.$state.snapshot));
    } catch (e) { }
    getRemoteCount();

    if (sessionActive && getViewerCount() > 0) {
        currentTime  = JSON.stringify(BGP.$state.at('screens').get()[0].currentTime);
        totalTime    = JSON.stringify(BGP.$state.at('screens').get()[0].totalTime);
        seekBarWidth = document.getElementById("timeSlider").clientWidth;
        
        completedWidth = ( ( currentTime * (seekBarWidth-12) ) / totalTime ).toFixed(3);
                
        if (completedWidth > seekBarWidth) completedWidth = seekBarWidth;

        if(prevousTime != currentTime) {
            if(!timeSeeking) {
                document.getElementById("timeSlider").getElementsByClassName('complete')[0].style.width = completedWidth + "px";
                document.getElementById("timeSlider").getElementsByClassName('marker')[0].style.left = completedWidth + "px";

                currentTimeOutput = secondsToTime(currentTime);
                document.getElementById("timer_current").innerHTML = currentTimeOutput;
            }
            
            durationTimeOutput = secondsToTime(totalTime);
            document.getElementById("timer_duration").innerHTML = durationTimeOutput;
            
        }
        prevousTime = currentTime;

        newPlayerState = JSON.stringify(BGP.$state.at('screens').get()[0].state);
        if (playerState != newPlayerState) {
            playerState = newPlayerState;
            togglePlayButton();

        }


    }
    

}
BGP.stateUpdated = stateUpdated;


function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}



function alphaFilterKeypress(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    return /[a-z0-9_]/i.test(charStr);
}

document.getElementById("hashtag_input").onkeypress = alphaFilterKeypress;

if(pageURl.indexOf("chrome-extension") !== -1) {
    window.onload = function () {
        if (BGP.prevConnection) {  //Restore state for current session.
            connectionSuccess();
        }
    };
}

window.onunload = function () {
   
};

var cSpeed = 5;
var cWidth = 32;
var cHeight = 32;
var cTotalFrames = 75;
var cFrameWidth = 32;
var cImageSrc = 'images/sprites.png';

var cImageTimeout = false;

function startAnimation() {

    document.getElementById('loaderImage').innerHTML = '<canvas id="canvas" width="' + cWidth + '" height="' + cHeight + '"><p>Your browser does not support the canvas element.</p></canvas>';

    //FPS = Math.round(100/(maxSpeed+2-speed));
    FPS = Math.round(100 / cSpeed);
    SECONDS_BETWEEN_FRAMES = 1 / FPS;
    g_GameObjectManager = null;
    g_run = genImage;

    g_run.width = cTotalFrames * cFrameWidth;
    genImage.onload = function () { cImageTimeout = setTimeout(fun, 0) };
    initCanvas();
}


function imageLoader(s, fun)//Pre-loads the sprites image
{
    clearTimeout(cImageTimeout);
    cImageTimeout = 0;
    genImage = new Image();
    genImage.onload = function () { cImageTimeout = setTimeout(fun, 0) };
    genImage.onerror = new Function('console.log(\'Could not load the image\')');
    genImage.src = s;
}

//The following code starts the animation
new imageLoader(cImageSrc, 'startAnimation()');


var keyCodeToSend;

function playVideo() {
	keyCodeToSend = "VIDEO_PLAY_" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);
}


function pauseVideo() {
    keyCodeToSend = "VIDEO_PAUSE_" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);  
}

function playPauseVideo() {

    if (!slidesEnabled) {
        if (playerState == 1)
            pauseVideo();
        else
            playVideo();

        togglePlayButton();
    } else if (slidesEnabled) { 
        nextSlide()
    }

    

}

var prevPlayerState;

function togglePlayButton() { 
    
    if(prevPlayerState != playerState) {
        if(playerState == 1 || playerState == 3)
            $("#playVideoBtn").attr("class", "pause_Video_Btn");
        else
            $("#playVideoBtn").attr("class", "play_Video_Btn");
    }
    prevPlayerState = playerState;
}

var seekToTime;
function seekToVideo(seconds) {

    seekToTime = seconds;
    BGP.$state.submitOp([{p:['seekTo'], od:null, oi:seekToTime}]);
}

var viewerCount = 0, listCounted = false;
var screensObject = [];
function getViewerCount() {
    viewerCount = 0; listCounted = false;

    try {
        screensObject = BGP.$state.at('screens').get();
    } catch (e) {
        console.log("Warning: Screens object not found.");
    }

    viewerCount = screensObject.length;
    //console.log(viewerCount);

    document.getElementById("viewer_count_total").innerHTML = viewerCount;

    return viewerCount;
};

function getViewerIndex(name) {
    foundIndex = -1;
    var viewers = getViewerCount();
    for (var i = 0; i < viewers; i++) {
        try {
            if (JSON.stringify(BGP.$state.at('screens').get()[i].name).indexOf("\"" + name + "\"") !== -1) {
                foundIndex = i;
                break;
            }
        }
        catch (e) { }
    }
    return foundIndex;
};

function getRemoteCount() {
    BGP.remoteCount = 0; BGP.remoteListCounted = false;

    try {
        BGP.remotesObject = BGP.$state.at('remotes').get();
    } catch (e) {
        console.log("Warning: Remotes object not found.");
    }

    BGP.remoteCount = BGP.remotesObject.length;
    //console.log(remoteCount);

    document.getElementById("remote_count_total").innerHTML = BGP.remoteCount;

    return BGP.remoteCount;
};

function flingURIButton() {
    BGP.newUrl = document.getElementById('addressBarTextArea').value;
    BGP.flingURI(document.getElementById('addressBarTextArea').value);
}

var completedVolWidth;

function toggleMute() {

    

    if (volumeMute) {
        BGP.currentVolume = prevVolume;

        BGP.$state.submitOp([{ p: ['volume'], od: null, oi: prevVolume}]);

        completedVolWidth = ( ( BGP.currentVolume * 88 ) / 100 );
        if (completedVolWidth > 100) completedVolWidth = 100;
        document.getElementsByClassName('complete')[0].style.width = completedVolWidth + "px";
        document.getElementsByClassName('marker')[0].style.left = completedVolWidth + "px";


        $("#muteVideoBtn").attr("class", "volmax_Video_Btn");

        volumeMute = false;
    }
    else {
        prevVolume = BGP.currentVolume;
        BGP.currentVolume = 0;

        BGP.$state.submitOp([{ p: ['volume'], od: null, oi: 0}]);
        
        document.getElementsByClassName('complete')[0].style.width =  "0px";
        document.getElementsByClassName('marker')[0].style.left =  "0px";


        $("#muteVideoBtn").attr("class", "mute_Video_Btn");

        volumeMute = true;
    }


}



function nextSlide() {
    keyCodeToSend = "SLIDE_NEXT" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);
}
function prevSlide() {
    keyCodeToSend = "SLIDE_PREV" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);
}
function firstSlide() {
    keyCodeToSend = "SLIDE_FIRST" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);
}
function lastSlide() {
    keyCodeToSend = "SLIDE_LAST" + keyCodeUid();
    BGP.$state.submitOp([{p:['keyCode'], od:null, oi:keyCodeToSend}]);
}


// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect_button').addEventListener('click', connectToHash);
    document.getElementById('disconnect_button').addEventListener('click', disconnectFromHash);
   
    document.getElementById('hashtag_input').addEventListener('keydown', pinInputChangeListener);
    document.getElementById('addressBarTextArea').addEventListener('keypress', addressBarChangeListener);
    document.getElementById('data').addEventListener('keydown', dataTextAreaChangeListener);


    
    document.getElementById('fling_button').addEventListener('click', flingURIButton);

    document.getElementById('muteVideoBtn').addEventListener('click', toggleMute);
    document.getElementById('playVideoBtn').addEventListener('click', playPauseVideo);

    document.getElementById('first_slide_btn').addEventListener('click', firstSlide);
    document.getElementById('prev_slide_btn').addEventListener('click', prevSlide);
    document.getElementById('next_slide_btn').addEventListener('click', nextSlide);
    document.getElementById('last_slide_btn').addEventListener('click', lastSlide);

    document.getElementById('invite_facebook_btn').addEventListener('click', inviteFacebookButton);
    document.getElementById('invite_twitter_btn').addEventListener('click', inviteTwitterButton);
    document.getElementById('invite_gooplus_btn').addEventListener('click', inviteGooPlusButton);

    document.getElementById('timeoutMsgCloseBtn').addEventListener('click', timeoutMsgCloseBtn);
    document.getElementById('reconnect_button').addEventListener('click', refreshConnection);

});

function pinInputChangeListener() {
    if (event.keyCode == 13) document.getElementById('connect_button').click();
}
function addressBarChangeListener() {
    if (event.keyCode == 13) document.getElementById('fling_button').click();
}
function dataTextAreaChangeListener() {
    if(event.keyCode==13){return false;}
}
function timeoutMsgCloseBtn() {
    document.getElementById('timeoutMessage').style.display='none';
}
function refreshConnection() {
    document.location.reload(true);
}



$(function () {
    $("#volumeSlider").on("change", function (e, val) {
        // e is event
        // val is current value
        
        BGP.$state.submitOp([{ p: ['volume'], od: null, oi: val}]);
        

        keyCodeToSend = "VIDEO_VOL_CHANGE_" + keyCodeUid();
        BGP.$state.submitOp([{ p: ['keyCode'], od: null, oi: keyCodeToSend}]);

        if ( val > 0 ) {
            volumeMute = false;
            $("#muteVideoBtn").attr("class", "volmax_Video_Btn");
        }
        else {
            volumeMute = true;
            $("#muteVideoBtn").attr("class", "mute_Video_Btn");
        }

    })

    $("#volumeSlider").on("changed", function (e, val) {
        // e is event
        // val is current value
        //console.log(val);
    })

    // for retrieve a current value you can call
    $("#volumeSlider").data('value');
})

var timeSeeking = false;
var seekToTime = 0;
var percentTime = 0;

var offSetInt;



$(function () {
    $("#timeSlider").on("change", function (e, val) {
        // e is event
        // val is current value

        percentTime = val;
        seekBarWidth = document.getElementById("timeSlider").clientWidth;


        if (sessionActive && getViewerCount() > 0) {

            totalTime = JSON.stringify(BGP.$state.at('screens').get()[0].totalTime);
            completedWidth = document.getElementById("timeSlider").getElementsByClassName('complete')[0].style.width;
            completedWidth = parseFloat(completedWidth).toFixed(3);
            if (completedWidth > (seekBarWidth - 12)) completedWidth = (seekBarWidth - 12);

            //console.log(completedWidth);

            offSetInt = 0;
            if (seekToTime <= 12)
                offSetInt = 0;

            seekToTime = parseFloat(offSetInt + (totalTime * completedWidth) / (seekBarWidth - 12)).toFixed(3);


            seekToVideo(seekToTime);


            //Update local current time.

            currentTimeOutput = secondsToTime(seekToTime);
            document.getElementById("timer_current").innerHTML = currentTimeOutput;

            //TODO: set this to send the slide number the slider seeked to.

        }




        timeSeeking = true;
    })



    $("#timeSlider").on("changed", function (e, val) {
        // e is event
        // val is current value
        //console.log(val);


        if ((ytEnabled && ytPlayerEnabled) || vimeoPlayerEnabled) {

            keyCodeToSend = "VIDEO_SEEKTO_" + keyCodeUid();
            BGP.$state.submitOp([{ p: ['keyCode'], od: null, oi: keyCodeToSend}]);

        } else if (slidesEnabled) {

            keyCodeToSend = "SLIDE_SEEKTO_" + keyCodeUid();
            BGP.$state.submitOp([{ p: ['keyCode'], od: null, oi: keyCodeToSend}]);

        }
        

        window.setTimeout(function () { timeSeeking = false; }, 500);

    })

    // for retrieve a current value you can call
    $("#timeSlider").data('value');
})


function secondsToTime(string){
	var totalSeconds = parseInt(string);
	if (!slidesEnabled) {
	    if (isNaN(totalSeconds)) {
	        totalSeconds = 0;
	    }
	    var minutes = Math.floor(totalSeconds / 60);
	    var seconds = totalSeconds % 60;

	    if (seconds < 10) {
	        seconds = "0" + seconds;
	    }

	    if (minutes < 60) {
	        //if(minutes < 10){
	        //	minutes = "0" + minutes;
	        //}
	        return minutes + ":" + seconds;
	    } else {
	        var hours = Math.floor(minutes / 60);
	        minutes = minutes % 60;
	        if (minutes < 10 && hours > 0) {
	            minutes = "0" + minutes;
	        }
	        //if(hours < 10){
	        //	hours = "0" + hours;
	        //}
	        return hours + ":" + minutes + ":" + seconds;
	    }
	} else {

	    return totalSeconds;
    
    }
}


function removeElement(id) {
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

var loadInfo = function (videoId) {

    if (document.getElementById("videoData"))
        removeElement("videoData");

    var gdata = document.createElement("script");
    gdata.src = "https://gdata.youtube.com/feeds/api/videos/" + videoId + "?v=2&alt=jsonc&callback=storeInfoTitle";
    gdata.id = "videoData";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(gdata);

};

var storeInfoTitle = function (info) {
    console.log(info.data.title);


    var uploadedDate = info.data.uploaded;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");

    document.getElementById("video_title").innerHTML = info.data.title;
    document.getElementById('video_title').href = "http://www.youtube.com/watch?v=" + info.data.id;

    document.getElementById("video_thumb").src = info.data.thumbnail.sqDefault;

    document.getElementById("video_thumb_link").href = "http://www.youtube.com/watch?v=" + info.data.id;

    //document.getElementById("video_uploader").innerHTML = info.data.uploader;

    var uploadedDate = info.data.uploaded;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");

    document.getElementById("video_uploaded").innerHTML = uploadedDate;

    var videoViewCount = info.data.viewCount + "";
    videoViewCount = videoViewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    document.getElementById("video_views").innerHTML = videoViewCount + " views";

    if (document.getElementById("channelData"))
        removeElement("channelData");

    var gdata2 = document.createElement("script");
    gdata2.src = "https://gdata.youtube.com/feeds/api/users/" + info.data.uploader + "?v=2&alt=json&callback=storeVidInfoChannelThumb";
    gdata2.id = "channelData";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(gdata2);

};

var storeVidInfoChannelThumb = function (info) {

    //document.getElementById("video_thumbnail").innerHTML = "<img src=\"" + info.entry.media$thumbnail.url + "\" id=\"video_thumb_image\">";
    document.getElementById("video_uploader").innerHTML = info.entry.yt$username.display;

};

var loadSlideInfo = function (slideUrl) {

    if (document.getElementById("slideData"))
        removeElement("slideData");

    var ssdata = document.createElement("script");
    ssdata.src = "https://www.slideshare.net/api/oembed/2?url=" + slideUrl + "&format=jsonp&callback=storeSlideInfo";
    ssdata.id = "slideUrl";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(ssdata);

};
var storeSlideInfo = function (info) {

    //console.log(JSON.stringify(info));
    document.getElementById("video_thumb").src = "http:" + info.thumbnail;

    document.getElementById("video_thumb_link").href = currentUrl;

    document.getElementById("video_uploader").innerHTML = info.author_name;

    document.getElementById("video_uploaded").innerHTML = info.total_slides + " slides";
    document.getElementById("video_title").innerHTML = info.title;
    document.getElementById('video_title').href = currentUrl;
    document.getElementById("video_views").innerHTML = "";
}

var loadVimeoInfo = function (vimeo_id) {

    if (document.getElementById("vimeoData"))
        removeElement("vimeoData");

    var vmdata = document.createElement("script");

    vmdata.src = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=storeVimeoInfo";
    console.log("http://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=storeVimeoInfo");
    //vmdata.src = "http://vimeo.com/api/oembed.json?url=" + vimeoUrl + "&callback=storeVimeoInfo";
    vmdata.id = "vimeoData";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(vmdata);

};
var storeVimeoInfo = function (info) {
    console.log(info[0].title);

    document.getElementById("video_title").innerHTML = info[0].title;
    document.getElementById('video_title').href = currentUrl;
    
    document.getElementById("video_thumb").src = info[0].thumbnail_medium;
    document.getElementById("video_thumb_link").href = currentUrl;

    document.getElementById("video_uploader").innerHTML = info[0].user_name;
    document.getElementById('video_uploader').href = info[0].user_url;

    var uploadedDate = info[0].upload_date;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");
    document.getElementById("video_uploaded").innerHTML = uploadedDate;

    var videoViewCount = info[0].stats_number_of_plays + "";
    videoViewCount = videoViewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    document.getElementById("video_views").innerHTML = videoViewCount + " plays";
               
}

function inviteFacebookButton() {

    open('http://www.facebook.com/share.php?u=http://flinger.co/%23' + BGP.docname, 'facebook', 'toolbar=no,width=700,height=400');
    //window.open('http://www.facebook.com/share.php?u=http://flinger.co/%23' + BGP.docname,'_blank');
}
function inviteTwitterButton() {

    open('http://twitter.com/share?text=Join%20Flinger%20Channel%20%23'+ BGP.docname +'%20to%20watch%20and%20Fling%20videos%20with%20me%20%40flingerco&url=http://flinger.co/%23' + BGP.docname, 'twitter', 'toolbar=no,width=700,height=400');
    //window.open('http://twitter.com/share?text=Join%20Flinger%20Channel%20%23'+ BGP.docname +'%20to%20watch%20and%20Fling%20videos%20with%20me%20%40flingerco&url=http://flinger.co/%23' + BGP.docname,'_blank');
}
function inviteGooPlusButton() {
    
    open('https://plus.google.com/share?url=http://flinger.co/%23' + BGP.docname, 'g-plus', 'toolbar=no,width=700,height=400');
    //window.open('https://plus.google.com/share?url=http://flinger.co/%23' + BGP.docname,'_blank');
}

BGP.uiPage = document;
BGP.timeoutDialogBox = document.getElementById('timeoutMessage');

var buttons = document.querySelectorAll('button');
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', BGP.trackButtonClick);
}

var as = document.querySelectorAll('a');
for (var i = 0; i < as.length; i++) {
    as[i].addEventListener('click', BGP.trackButtonClick);
}