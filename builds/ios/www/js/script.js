
/*         Developed by @RobertDaleSmith founder of @MoteLabs.           
           ____    ___  @FlingerCo / founders@flinger.co                                                       
          /\  _`\ /\_ \    __                                                             
          \ \ \L\_\//\ \  /\_\    ___      __      __   _ __      ___    ___   
           \ \  _\/ \ \ \ \/\ \ /' _ `\  /'_ `\  /'__`\/\`'__\   /'___\ / __`\ 
            \ \ \/   \_\ \_\ \ \/\ \/\ \/\ \L\ \/\  __/\ \ \/ __/\ \__//\ \L\ \
             \ \_\   /\____\\ \_\ \_\ \_\ \____ \ \____\\ \_\/\_\ \____\ \____/
              \/_/   \/____/ \/_/\/_/\/_/\/___L\ \/____/ \/_/\/_/\/____/\/___/ 
                                           /\____/                             
                                           \_/__/                  (C)(TM)2013
*/

//Detect whether extension or not, then link DOM to background page.
var pageURl = window.location.href;
var BGP = null;
if(pageURl.indexOf("chrome-extension") !== -1) {
         BGP = chrome.extension.getBackgroundPage();
} else { BGP = window; }

//Check if WP8 App
var isWMPApp = false;
if (pageURl.indexOf("x-wmapp") !== -1) {
    isWMPApp = true;
} else { BGP = window; }

//Google analytics initialization stuff.
if (pageURl.indexOf("chrome-extension") !== -1) {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-39500794-3']);
    _gaq.push(['_trackPageview']);
    (function () {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
}

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
    } else if (filetype=="css"){ //if filename is an external CSS file
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}
if ( !(pageURl.indexOf("chrome-extension") !== -1) ) {
    //loadjscssfile("js/bcsocket.js", "js");
    //loadjscssfile("js/share.js", "js");
    //loadjscssfile("js/json.js", "js");

    loadjscssfile("js/background.js", "js");
}


//Bunch of front-end shit for Flinger --ported..
var sessionActive = BGP.sessionActive;
var volumeMute = false;
var prevVolume = 0;
var clearingChatActive = false;


function uid() {
    return ("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).substr(-6);
}
function keyCodeUid() {
    return ("" + (Math.random() * Math.pow(36, 8) << 0)).substr(-8);
}

var timeOutCounter = 0;
var timeOutTimer;
var connectAniActive = false;
var animationInterval = null;

function connectToHash() {

    BGP.docname = document.getElementById("hash_input").value;
    console.log(document.getElementById("hash_input").value);

    if (BGP.docname.length != 6) {
        //Input validation. Must be 6 alphanumeric characters or shake and error displayed.
        document.getElementById('connect_status_instr').style.color = "#f05d62";
        document.getElementById('connect_status_instr').textContent = "6 digit alphanumeric code only";
        setTimeout(function () {
            document.getElementById('connect_status_instr').style.color = "#848aad";
            document.getElementById('connect_status_instr').textContent = "Enter a code to pair to a channel";
        }, 5000);
    }
    else {
        connectAniLoop();
        animationInterval = setInterval(function () { connectAniLoop(); }, 5000);
        document.getElementById("connect_button").textContent = "CANCEL";

        document.getElementById('connect_status_instr').style.color = "#fff";
        document.getElementById('connect_status_instr').textContent = "Connecting to " + BGP.docname + "...";

        //document.getElementById('hash_input').disabled = 'true';

        BGP.docname = BGP.docname.toLowerCase();
        document.getElementById("hash_input").value = BGP.docname;

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
            } else {
                timeOutCounter += 250;
            }
            if(timeOutCounter >= 15,000) {
                alert("Connection Timed Out... Check connection and try again.");
                disconnectFromHash();
            } 
        }
    }
}



function connectionSuccess() {
    sessionActive = true;
    console.log("Connected to " + BGP.docname);

    clearTimeout(animationInterval);
    animationInterval = null;

    document.getElementById("pair_status_container").style.backgroundColor = "#8acab0";
    document.getElementById("pair_status_container").style.color = "#fff";

    document.getElementById("connect_status_icon").style.borderRightColor = "#7cbca2";
    document.getElementById("connect_status_icon").style.backgroundImage = "url('images/status_is_connected.png')";
    document.getElementById("connect_status_label").textContent = "PAIRED!";
    document.getElementById("connect_status_instr").textContent = "Successfully connected to " + BGP.docname + "!";
    
    setTimeout(function () {
        $('#connect_container').fadeOut('slow', function () {
            document.getElementById('connect_container').style.display = "none";
        });
    }, 250);

    document.getElementById('channel_details_docname').innerHTML = BGP.docname;

    //document.getElementById('intro_tv_url').innerHTML = "http://flinger.co/#" + BGP.docname;

    document.getElementById('invite_buttons_url').innerHTML  = '<a>flinger.co/#' + BGP.docname + '</a>';
    $("#invite_buttons_url").click(function () {
	    try {			
			window.plugins.facebook.sharePicker(
				 function(){
				 },
				 function(){
					alert("We have a problem with the facebook share plugin");
				 },
				 'http://flinger.co/#' + BGP.docname
			);
					
		} catch(e){
			open('"http://flinger.co/#' + BGP.docname, '_system');
		}
		
    });
    
    document.getElementById('invite_buttons_url2').innerHTML  = '<a>remote.flinger.co/#' + BGP.docname + '</a>';
    $("#invite_buttons_url2").click(function () {
	    try {			
			window.plugins.facebook.sharePicker(
				 function(){
				 },
				 function(){
					alert("We have a problem with the facebook share plugin");
				 },
				 'http://remote.flinger.co/#' + BGP.docname
			);
					
		} catch(e){
			open('"http://remote.flinger.co/#' + BGP.docname, '_system');
		}
		
    });
    
    
    //document.getElementById('invite_buttons_url').href = "http://flinger.co/#" + BGP.docname;

    document.getElementById("hash_input").value = BGP.docname;
    //document.getElementById('hash_input').disabled = 'true';

    // Attaching the ShareJS file to the editor
    //shareDocument.attach_textarea(data);
    stateUpdated();
    if ( !(pageURl.indexOf("?popup") !== -1) ) {
        BGP.updateUIState = stateUpdated;
    } else {
        BGP.updateUIState2 = stateUpdated;
    }
    


    if (BGP.docname == "0debug") {
        document.getElementById('data').style.display = "block";
    } else {
        document.getElementById('data').style.display = "none";
    }

}



function disconnectFromHash() {
    sessionActive = false;
    console.log("Disconnecting from " + BGP.prevHasTag);
    //document.getElementById('hash_input').disabled = 'false';
    
    console.log("Disconnected from " + BGP.prevHasTag);
    
    //$("#hash_input").removeAttr("disabled");
    
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


    document.getElementById("hash_input").value = "";
    BGP.sessionActive = false;

    localStorage.removeItem('saved-hash-id');
    
    if(pageURl.indexOf("chrome-extension") !== -1)
        BGP.document.location.reload(true);

    disconnectFromChannel();
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

var prevousTime = 0;
var ytEnabled = false, slidesEnabled = false, ytPlayerEnabled = false, vimeoPlayerEnabled = false;

var completedWidth, currentTime, totalTime, currentHours, currentMinutes, currentSeconds, durationHours, durationMinutes, durationSeconds;
var playerState = -1, newPlayerState, currentTimeOutput, durationTimeOutput, seekBarWidth;

var video_id = 0, vimeo_id = 0;


var que = "",
prevQue = "",
chatLog = "",
prevChatLog = "";
prevChatObj = null;
chatLogCount = 0;


var addToChatUI = function (message, username, time) {

    var date = new Date(time);
    var $cont = $('#chat_conversation_container');
    var isQueueAlert = false, isFlingAlert = false;

    if (username.indexOf("ALERT_QUEUE_") !== -1) isQueueAlert = true;
    if (username.indexOf("ALERT_FLING_") !== -1) isFlingAlert = true;

    username = username.replace("ALERT_QUEUE_", "");
    username = username.replace("ALERT_FLING_", "");

    var userType = "";
    if (username == BGP.remoteName) userType = "_me";
    //console.log(username +"  =?  "+ BGP.remoteName + "  " + userType);

    var alertType = "";
    if (isQueueAlert) alertType = " queued";
    if (isFlingAlert) alertType = " flung";
    //console.log("msg type" + userType +" "+ isQueueAlert + " " + isFlingAlert);

    $cont.append('<div class="chat_entry"><div class="chat_entry_inner' + userType + '"><div class="chat_entry_user' + userType + '">' + username + ' </div><div class="chat_entry_msg'+ userType + alertType +'">' + message + '</div><div class="chat_side_line' + userType + '"></div></div><div class="chat_icon' + userType + alertType + '"></div><div class="chat_timestamp' + userType + '">' + date.customFormat("#MMM# #DD#,#YYYY# #h#:#mm# #AMPM#") + '</div></div></div>');

    toBottom("chat_conversation_container");
}

var prevQueCount = null;
function stateUpdated() {

    //Check if que count has changed. If so then change UI counter and new video added dot.
    if (queCount != prevQueCount) { 
        if(queCount >= 1)document.getElementById("home_up_next_button_text").textContent = "QUEUE (" + queCount + ")"; else document.getElementById("home_up_next_button_text").textContent = "QUEUE";
        if (queCount > prevQueCount) { if (!hasClass(document.getElementById("home_up_next_button"), "home_menu_button_disabled2")) document.getElementById("up_next_status_dot").style.display = "inline-block"; }
    } prevQueCount = queCount;

    //Check que list for changes and update them in the UI if found.
    try {
        que = JSON.stringify(BGP.$state.at('que').get());
    } catch(e){}
    

    if (prevQue != que) {

        var queObject = JSON.parse(que);

        $('#up_next_que_container').empty();
        queCount = 0;
        for (var i = 0; i < queObject.length; i++) {
            try {
                addToQue(queObject[i].url, queObject[i].time, queObject[i].username);
            } catch (e) { }
        }
    
    }
    prevQue = que;



    //Check chat log for changes and update them in the UI if found.
    try {
        chatLog = JSON.stringify(BGP.$state.at('chat').get());
    } catch(e){}
    

    if (prevChatLog != chatLog) {

        if (prevChatLog.length > chatLog.length) { 
            $('#chat_conversation_container').empty();
            chatLogCount = 0;
        }

        var chatObject = JSON.parse(chatLog);

        if(!clearingChatActive)
            for (chatLogCount; chatLogCount < chatObject.length; chatLogCount++) {
                addToChatUI(chatObject[chatLogCount].message, chatObject[chatLogCount].username, chatObject[chatLogCount].time);
            }

    }
    prevChatLog = chatLog;



    try {
        url = BGP.$state.at('url').get();
    } catch(e){}
    BGP.prevUrl = url;
     
    if (currentUrl != url) {
        document.getElementById('addressBarTextArea').value = url;

        video_id = BGP.youtube_parser(url);

        vimeo_id = 0;
        if (url.indexOf("vimeo.com") !== -1) {
            vimeo_id = BGP.vimeo_parser(url);
        }

        if (video_id != 0) {
            //Is YouTube URL
            loadInfo(video_id);

            if (document.getElementById("now_playing_favicon"))
                removeElement("now_playing_favicon");
            
            document.getElementById("slide_controls").style.display = "none";
            
            ytEnabled = true;
            ytPlayerEnabled = true;
            slidesEnabled = false;
            vimeoPlayerEnabled = false;

            document.getElementById("adblock_iframe").src = "http://flinger.co/ad/?fling_url=" + url.replace("http://","").replace("https://","");

        } else if (url.indexOf("slideshare.net") !== -1) {
            //Is SlideShare URL
            loadSlideInfo(url);

            if (document.getElementById("now_playing_favicon"))
                removeElement("now_playing_favicon");
            
            document.getElementById("slide_controls").style.display = "block";
            
            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = true;
            vimeoPlayerEnabled = false;

        } else if (vimeo_id != 0) {

            loadVimeoInfo(vimeo_id);

            if (document.getElementById("now_playing_favicon"))
                removeElement("now_playing_favicon");

            document.getElementById("slide_controls").style.display = "none";

            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = false;
            vimeoPlayerEnabled = true;

            


        } else {
            //Is Misc URL
            
            document.getElementById("now_playing_video_title").innerHTML = "<br>Misc Web Link";
            document.getElementById("now_playing_video_provider").textContent = "Displayed in iFrame";
            document.getElementById("now_playing_video_uploader").textContent = url;

            document.getElementById("now_playing_video_date").textContent = "";
            
            document.getElementById("address_fav_icon").textContent = "";


            if (document.getElementById("now_playing_favicon"))
                removeElement("now_playing_favicon");

            $('#now_playing_thumb_container').append('<div id="now_playing_favicon"><img src="https://plus.google.com/_/favicon?domain='+ url +'" alt="fav_icon"></div>');


            document.getElementById("now_playing_thumbnail").src = "images/video_thumbnail_blank.png";
            //document.getElementById("now_playing_thumbnail").href = url;

            document.getElementById("slide_controls").style.display = "none";

            ytEnabled = false;
            ytPlayerEnabled = false;
            slidesEnabled = false;
            vimeoPlayerEnabled = false;
        }
        document.getElementById("address_fav_icon").src = "https://plus.google.com/_/favicon?domain=" + url;

    }
    currentUrl = url;


    try {
        BGP.currentVolume = BGP.$state.at('volume').get();
    } catch (e) { }

    if (prevVolume != BGP.currentVolume)
    {
        completedWidth = ( ( BGP.currentVolume * 130 ) / 100 );
        if (completedWidth > 130) completedWidth = 130;
        document.getElementById("volumeSlider").getElementsByClassName('complete')[0].style.width = completedWidth + "px";
        document.getElementById("volumeSlider").getElementsByClassName('marker')[0].style.left = completedWidth + "px";

        var val = BGP.currentVolume;
        if ( val >= 66 ) {
            volumeMute = false;
            $("#muteVideoBtn").attr("class", "volmax_Video_Btn");
        } else if( val < 66 && val >= 33) {
            $("#muteVideoBtn").attr("class", "volmid_Video_Btn");
        } else if( val < 33 && val > 0) {
            $("#muteVideoBtn").attr("class", "vollow_Video_Btn");
        } else {
            volumeMute = true;
            $("#muteVideoBtn").attr("class", "mute_Video_Btn");
        }
    }

    try {
        $('#data').text(JSON.stringify(BGP.$state.snapshot));
    } catch (e) { }
    getRemoteCount();



        
        

    if (sessionActive && getViewerCount() > 0) {
        currentTime  = JSON.stringify(BGP.$state.at('screens').get()[0].currentTime);
        totalTime    = JSON.stringify(BGP.$state.at('screens').get()[0].totalTime);
        seekBarWidth = document.getElementById("timeSlider").clientWidth;
        
        completedWidth = ( ( currentTime * (seekBarWidth-0) ) / totalTime ).toFixed(3);
                
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
if ( !(pageURl.indexOf("?popup") !== -1) ) {
    BGP.updateUIState = stateUpdated;
} else {
    BGP.updateUIState2 = stateUpdated;
}



function IsJsonString(str) {
    try {   JSON.parse(str); } 
    catch(e) { return false; }
    return true;
}

function alphaFilterKeypress(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    return /[a-z0-9_]/i.test(charStr);
}



//if(pageURl.indexOf("chrome-extension") !== -1) {
//    window.onload = function () {
//        if (BGP.prevConnection) {  //Restore state for current session.
//            connectionSuccess();
//        }
//    };
//}


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

    document.getElementById("channel_details_viewers_count").innerHTML = viewerCount;

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


var getRemoteCount = function() {
    
    BGP.remoteCount = 0; BGP.remoteListCounted = false;

    try {
        BGP.remotesObject = BGP.$state.at('remotes').get();
    } catch (e) {
        console.log("Warning: Remotes object not found.");
    }

    BGP.remoteCount = BGP.remotesObject.length;
    //console.log(remoteCount);

    document.getElementById("channel_details_remotes_count").innerHTML = BGP.remoteCount;

    return BGP.remoteCount;
};


function flingURIButton() {
    BGP.newUrl = document.getElementById('addressBarTextArea').value;
    BGP.flingURI(document.getElementById('addressBarTextArea').value);
}
function flingQueButton() {
    BGP.newUrl = document.getElementById('addressBarTextArea').value;
    BGP.flingToQue(document.getElementById('addressBarTextArea').value);
}
var completedVolWidth;

function toggleMute() {

    

    if (volumeMute) {
        BGP.currentVolume = prevVolume;

        BGP.$state.submitOp([{ p: ['volume'], od: null, oi: prevVolume}]);

        completedVolWidth = ( ( BGP.currentVolume * 135 ) / 100 );
        if (completedVolWidth > 135) completedVolWidth = 135;
        document.getElementsByClassName('complete')[1].style.width = completedVolWidth + "px";
        document.getElementsByClassName('marker')[1].style.left = completedVolWidth + "px";


        $("#muteVideoBtn").attr("class", "volmax_Video_Btn");

        volumeMute = false;
    }
    else {
        prevVolume = BGP.currentVolume;
        BGP.currentVolume = 0;

        BGP.$state.submitOp([{ p: ['volume'], od: null, oi: 0}]);
        
        document.getElementsByClassName('complete')[1].style.width =  "0px";
        document.getElementsByClassName('marker')[1].style.left =  "0px";


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

function pinInputChangeListener() {
    if (event.keyCode == 13) document.getElementById('connect_button').click();
}
function addressBarChangeListener() {
    if (event.keyCode == 13) document.getElementById('fling_uri_button').click();
}

function noenter() {
  return !(window.event && window.event.keyCode == 13); }


function searchBarChangeListener() {
    if (event.keyCode == 13) { searchYouTube(); return noenter();  }
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

        if ( val >= 66 ) {
            volumeMute = false;
            $("#muteVideoBtn").attr("class", "volmax_Video_Btn");
        } else if( val < 66 && val >= 33) {
            $("#muteVideoBtn").attr("class", "volmid_Video_Btn");
        } else if( val < 33 && val > 0) {
            $("#muteVideoBtn").attr("class", "vollow_Video_Btn");
        } else {
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
            if (completedWidth > (seekBarWidth - 0)) completedWidth = (seekBarWidth - 0);

            //console.log(completedWidth);

            offSetInt = 0;
            if (seekToTime <= 0)
                offSetInt = 0;

            seekToTime = parseFloat(offSetInt + (totalTime * completedWidth) / (seekBarWidth - 0)).toFixed(3);


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

}

var storeInfoTitle = function (info) {
    console.log(info.data.title);
    
    var uploadedDate = info.data.uploaded;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");

    document.getElementById("now_playing_video_title").textContent = info.data.title;
    //document.getElementById('now_playing_video_title').href = "http://www.youtube.com/watch?v=" + info.data.id;
    $("#now_playing_video_title").click(function () { window.open('http://www.youtube.com/watch?v=' + info.data.id, '_system'); });

    document.getElementById("now_playing_thumbnail").src = info.data.thumbnail.sqDefault;

    document.getElementById("now_playing_thumbnail").href = "http://www.youtube.com/watch?v=" + info.data.id;
    
    var uploadedDate = info.data.uploaded;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");

    document.getElementById("now_playing_video_date").textContent = uploadedDate;

    var videoViewCount = info.data.viewCount + "";
    videoViewCount = videoViewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    document.getElementById("now_playing_video_views").textContent = videoViewCount + " views";

    if (document.getElementById("channelData"))
        removeElement("channelData");

    var gdata2 = document.createElement("script");
    gdata2.src = "https://gdata.youtube.com/feeds/api/users/" + info.data.uploader + "?v=2&alt=json&callback=storeVidInfoChannelThumb";
    gdata2.id = "channelData";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(gdata2);

}

var storeVidInfoChannelThumb = function (info) {

    //document.getElementById("now_playing_thumbnail").textContent = "<img src=\"" + info.entry.media$thumbnail.url + "\" id=\"video_thumb_image\">";
    document.getElementById("now_playing_video_uploader").textContent = info.entry.yt$username.display;
    document.getElementById("now_playing_video_provider").textContent = "YouTube";
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
    document.getElementById("now_playing_thumbnail").src = "http:" + info.thumbnail;

    document.getElementById("now_playing_thumbnail").href = currentUrl;

    document.getElementById("now_playing_video_uploader").textContent = info.author_name;
    document.getElementById("now_playing_video_provider").textContent = "SlideShare";

    document.getElementById("now_playing_video_date").textContent = "";
    document.getElementById("now_playing_video_title").textContent = info.title;
    //document.getElementById('now_playing_video_title').href = currentUrl;
    $("#now_playing_video_title").click(function () { window.open(currentUrl, '_system'); });
    document.getElementById("now_playing_video_views").textContent = info.total_slides + " slides";
}

var loadVimeoInfo = function (vimeo_id) {

    if (document.getElementById("vimeoData"))
        removeElement("vimeoData");

    var vmdata = document.createElement("script");

    vmdata.src = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=storeVimeoInfo";
    //console.log("http://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=storeVimeoInfo");
    //vmdata.src = "http://vimeo.com/api/oembed.json?url=" + vimeoUrl + "&callback=storeVimeoInfo";
    vmdata.id = "vimeoData";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(vmdata);

};
var storeVimeoInfo = function (info) {
    console.log(info[0].title);

    document.getElementById("now_playing_video_title").textContent = info[0].title;
    //document.getElementById('now_playing_video_title').href = currentUrl;
    $("#now_playing_video_title").click(function () { window.open(currentUrl, '_system'); });
    
    document.getElementById("now_playing_thumbnail").src = info[0].thumbnail_medium;
    document.getElementById("now_playing_thumbnail").href = currentUrl;

    document.getElementById("now_playing_video_uploader").textContent = info[0].user_name;
    document.getElementById('now_playing_video_uploader').href = info[0].user_url;

    document.getElementById("now_playing_video_provider").textContent = "Vimeo";

    var uploadedDate = info[0].upload_date;
    uploadedDate = uploadedDate.substring(0, 10).replace(/-/g, "/");
    document.getElementById("now_playing_video_date").textContent = uploadedDate;

    var videoViewCount = info[0].stats_number_of_plays + "";
    videoViewCount = videoViewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    document.getElementById("now_playing_video_views").textContent = videoViewCount + " plays";
               
}


function inviteFacebookButton() {

		
	
	try {
		
		window.plugins.facebook.composeWallPost(
			 function(){
			 },
			 function(){
				alert("We have a problem with the facebook share plugin");
			 },
			 'http://flinger.co/#' + BGP.docname
		);
				
	} catch(e){
		open('http://www.facebook.com/share.php?u=http://flinger.co/%23' + BGP.docname, '_system');
	}
        
	
	
    //open('http://www.facebook.com/share.php?u=http://flinger.co/%23' + BGP.docname, '_system');
    //window.open('http://www.facebook.com/share.php?u=http://flinger.co/%23' + BGP.docname,'_blank');
}
function inviteTwitterButton() {
	
	try{
		window.plugins.twitter.isTwitterAvailable(
			function(bool){ 
				if(bool){
					window.plugins.twitter.composeTweet(
						 function(){
						 },
						 function(){
							alert("We have a problem with the plugin");
						 },
						 'Join Flinger Channel #'+ BGP.docname +' to watch and Fling videos with me @flingerco http://flinger.co/#' + BGP.docname
					);
				} else {
					alert("Twitter is not available");
				}
			},
			function(){
				alert("We have a problem with the flinger twitter plugin.");
			}
		);
	} catch(e){
		open('http://twitter.com/share?text=Join%20Flinger%20Channel%20%23'+ BGP.docname +'%20to%20watch%20and%20Fling%20videos%20with%20me%20%40flingerco&url=http://flinger.co/%23' + BGP.docname, '_system');
	}
	
	
    //open('http://twitter.com/share?text=Join%20Flinger%20Channel%20%23'+ BGP.docname +'%20to%20watch%20and%20Fling%20videos%20with%20me%20%40flingerco&url=http://flinger.co/%23' + BGP.docname, 'twitter', 'toolbar=no,width=700,height=400');
    //window.open('http://twitter.com/share?text=Join%20Flinger%20Channel%20%23'+ BGP.docname +'%20to%20watch%20and%20Fling%20videos%20with%20me%20%40flingerco&url=http://flinger.co/%23' + BGP.docname,'_blank');
}
function inviteGooPlusButton() {
    
	try {
		
		window.plugins.googplus.composeWallPost(
			 function(){
			 },
			 function(){
				alert("We have a problem with the google plus share plugin");
			 },
			 'http://flinger.co/#' + BGP.docname
		);
				
	} catch(e){
		open('https://plus.google.com/share?url=http://flinger.co/%23' + BGP.docname, '_system');
	}
	
	
	
    //open('https://plus.google.com/share?url=http://flinger.co/%23' + BGP.docname, 'g-plus', 'toolbar=no,width=700,height=400');
    //window.open('https://plus.google.com/share?url=http://flinger.co/%23' + BGP.docname,'_blank');
}

BGP.uiPage = document;




//Splash logo animation to be looped after connection button is pressed until successful connection.
var connectAniLoop = function () {
    if (!connectAniActive) {
        active = true;
        $('#boom_1').animate({ rotate: '+=1080deg', scale: '2.5', top: "-=950px", left: "-=950px" }, 1200);
        $('#boom_2').animate({ rotate: '+=1080deg', scale: '2.5', top: "-=0px", left: "+=1050px" }, 1200);
        $('#boom_3').animate({ rotate: '+=1080deg', scale: '2.5', top: "+=950px", left: "-=950px" }, 1200);

        $('#boom_1').animate({ rotate: '+=1080deg', scale: '1', top: "+=950px", left: "+=950px" }, 2400);
        $('#boom_2').animate({ rotate: '+=1080deg', scale: '1', top: "+=0px", left: "-=1050px" }, 2400);
        $('#boom_3').animate({ rotate: '+=1080deg', scale: '1', top: "-=950px", left: "+=950px" }, 2400, function () { connectAniActive = false; });
    }
}


var main_menu_open = false;
var toggleMainMenu = function () {
    if (!main_menu_open) {
        $('#app_home_container').animate({ left: "255px" }, 150);
        $('#main_left_menu').animate({ left: "0px" }, 150);
        main_menu_open = true;

    } else {
        $('#app_home_container').animate({ left: "0px" }, 150);
        $('#main_left_menu').animate({ left: "-255px" }, 150);
        main_menu_open = false;

        closeMenuOptionPanelsBut("");
    }
};


var main_menu_config_open = false;
var toggleConfigMenu = function () {
    if (!main_menu_config_open) {
        document.getElementById("options_button_config_panel").style.display = "block";
        main_menu_config_open = true;

    } else {
        document.getElementById("options_button_config_panel").style.display = "none";
        main_menu_config_open = false;

    }

    closeMenuOptionPanelsBut("options_button_config_panel");

};

var main_menu_about_open = false;
var toggleAboutMenu = function () {
    if (!main_menu_about_open) {
        document.getElementById("options_button_about_panel").style.display = "block";
        main_menu_about_open = true;

    } else {
        document.getElementById("options_button_about_panel").style.display = "none";
        main_menu_about_open = false;

    }

    closeMenuOptionPanelsBut("options_button_about_panel");
    
};

var main_menu_help_open = false;
var toggleHelpMenu = function () {
    if (!main_menu_help_open) {
        document.getElementById("options_button_help_panel").style.display = "block";
        main_menu_help_open = true;

    } else {
        document.getElementById("options_button_help_panel").style.display = "none";
        main_menu_help_open = false;

    }

    closeMenuOptionPanelsBut("options_button_help_panel");
};

var main_menu_account_open = false;
var toggleAccountMenu = function () {
    if (!main_menu_account_open) {
        document.getElementById("options_button_account_panel").style.display = "block";
        main_menu_account_open = true;

    } else {
        document.getElementById("options_button_account_panel").style.display = "none";
        main_menu_account_open = false;

    }

    closeMenuOptionPanelsBut("options_button_account_panel");
};


var closeMenuOptionPanelsBut = function (exception) {
    if (exception != "options_button_about_panel") {
        document.getElementById("options_button_about_panel").style.display = "none";
        main_menu_about_open = false;
    }
    if (exception != "options_button_config_panel") {
        document.getElementById("options_button_config_panel").style.display = "none";
        main_menu_config_open = false;
    }
    if (exception != "options_button_help_panel") {
        document.getElementById("options_button_help_panel").style.display = "none";
        main_menu_help_open = false;
    }
    if (exception != "options_button_account_panel") {
        document.getElementById("options_button_account_panel").style.display = "none";
        main_menu_account_open = false;
    }
}

var main_search_open = false;
var toggleSearchMenu = function () {
    if (!main_search_open) {
        document.getElementById("main_right_menu").style.display = "block";
        $('#app_home_container').animate({ left: "-255px" }, 150);
        $('#main_right_menu').animate({ right: "0px" }, 150);
        main_search_open = true;
        if(document.getElementById("search_input_box").value == "") setTimeout(function () { document.getElementById("search_input_box").focus(); }, 150);

        $("#main_search_button").removeClass("main_search_button");
        $("#main_search_button").addClass("main_menu_return_icon");

         
    } else {
        $('#app_home_container').animate({ left: "0px" }, 150);
        $('#main_right_menu').animate({ right: "-255px" }, 150, function () { document.getElementById("main_right_menu").style.display = "none"; });
        main_search_open = false;
        document.getElementById("search_input_box").blur();

        $("#main_search_button").removeClass("main_menu_return_icon");
        $("#main_search_button").addClass("main_search_button");

    }
};



function toTop(id){ 
    document.getElementById(id).scrollTop=0 
} 

var defaultStep = 3;
var step = defaultStep;
function scrollDivDown(id){
    document.getElementById(id).scrollTop += step;
    //var timerDown = setTimeout("scrollDivDown('" + id + "')", 10);
} 

function scrollDivUp(id){ 
    document.getElementById(id).scrollTop-=step;
    //timerUp=setTimeout("scrollDivUp('"+id+"')",10) 
} 

function toBottom(id){ 
    document.getElementById(id).scrollTop=document.getElementById(id).scrollHeight 
} 

function toPoint(id){ 
    document.getElementById(id).scrollTop=100 
} 


//Onload function initializes UI elements.
var initializeUIElements = function () {

    //addToQue("http://www.youtube.com/watch?v=23ILVPkaLNE", "RED Labs: What Do Students Have to Say?", "YouTube", "http://img.youtube.com/vi/23ILVPkaLNE/default.jpg");
    //addToQue("http://www.youtube.com/watch?v=R0X4-2g1zPI", "Continuation Painting with Richard Prince", "YouTube", "http://img.youtube.com/vi/R0X4-2g1zPI/default.jpg");           
	
	$("#mote_labs_link").click(function () { window.open("http://motelabs.com/", '_system'); });
	
    //Set correct min-height for popup.
    if (pageURl.indexOf("chrome-extension") !== -1) {
        document.getElementById("body_wrapper").style.minHeight = "480px";
    }

    document.getElementById("user_name_input").value = BGP.remoteName;


    //Set click event for the connect button to simulate connection sequence and fake success.
    $("#connect_button").click(function () {
        if (animationInterval == null && !connectAniActive) {

            connectToHash();

        } else {

            clearTimeout(animationInterval);
            animationInterval = null;

            document.getElementById("connect_button").textContent = "CONNECT";
            document.getElementById('connect_status_instr').textContent = "Enter the 6-digit code found on-screen";

            disconnectFromHash();
        }
    });


    //Sets click event for the main menu bar's left slide menu button to toggle the display of the side menu panel.
    $("#main_menu_button").click(function () { toggleMainMenu(); });


    //Sets click event for the main menu bar's search button to toggle the display of the search panel.
    $("#main_search_button").click(function () { toggleSearchMenu(); });


    //Sets click action for main menu option buttons.
    
    //document.getElementById("options_button_home").onclick=function(){SomeJavaScriptCode};
    
    $("#options_button_home").click(function () { toggleMainMenu(); });
    $("#options_button_guide").click(function () { });


    $("#options_button_config").click(function () { toggleConfigMenu(); });
    $("#clear_chat_button").click(function () { toggleConfigMenu(); clearChatLogs(); toggleMainMenu(); });


    UserVoice = window.UserVoice || [];
    function showClassicWidget() {
        UserVoice.push(['showLightbox', 'classic_widget', {
            mode: 'full',
            primary_color: '#cc6d00',
            link_color: '#007dbf',
            default_mode: 'support',
            forum_id: 206987
        }]);
    }
    $("#feedback_support_button").click(function () { toggleConfigMenu(); window.open("http://flinger.uservoice.com/", "_blank"); toggleMainMenu(); });

    $("#sync_adverts_button").click(function () { toggleConfigMenu(); window.open("http://flinger.co/advertise-on-flinger", "_blank"); toggleMainMenu(); });

    $("#options_button_account").click(function () { toggleAccountMenu(); });
    $("#options_button_award").click(function () { });
    $("#options_button_help").click(function () { toggleHelpMenu(); });
    $("#options_button_about").click(function () { toggleAboutMenu(); });
    $("#options_button_disconnect").click(function () { disconnectFromHash(); });

    //Sets click event to demo search result.
    ///$(".search_result").click(function () { toggleSearchMenu(); });


    //Detects browser's viewport size and then resize UI elements to fit.
    makeHomeResponsive();


    //Sets the initial default active home panel indexes.
    prevPanelIndex1 = 1;
    prevPanelIndex2 = 2;


    //Sets home menu buttons click event to toggle active buttons and display corresponding panels.
    var toggleHomePanels = function (panelIndex) {

        bodyWidth = $(window).width();
        bodyHeight = $(window).height();

        if (bodyWidth < 1280 && bodyWidth >= 640) {

            $(".home_panel").css("display", "none");
            //$(".home_menu_button").attr("disabled", false);
            $(".home_menu_button").removeClass("home_menu_button_disabled1");
            $(".home_menu_button").removeClass("home_menu_button_disabled2");
            $(".home_menu_button").removeClass("home_menu_button_disabled3");
            $(".home_menu_button").removeClass("home_menu_button_disabled4");

            toggleHomeButtons(panelIndex);
            toggleHomeButtons(prevPanelIndex1);

        } else if (bodyWidth < 640) {

            $(".home_panel").css("display", "none");
            //$(".home_menu_button").attr("disabled", false);
            $(".home_menu_button").removeClass("home_menu_button_disabled1");
            $(".home_menu_button").removeClass("home_menu_button_disabled2");
            $(".home_menu_button").removeClass("home_menu_button_disabled3");
            $(".home_menu_button").removeClass("home_menu_button_disabled4");

            toggleHomeButtons(panelIndex);

        }
        prevPanelIndex2 = prevPanelIndex1;
        prevPanelIndex1 = panelIndex;

    }

    $("#home_control_button").click(function () { if (!($(this).attr('class').indexOf("_disabled") !== -1)) toggleHomePanels(1); });
    $("#home_up_next_button").click(function () { if (!($(this).attr('class').indexOf("_disabled") !== -1)) toggleHomePanels(2); document.getElementById("up_next_status_dot").style.display = "none"; });
    $("#home_chat_button").click(function () { if (!($(this).attr('class').indexOf("_disabled") !== -1)) toggleHomePanels(3); toBottom("chat_conversation_container"); });
    $("#home_invite_button").click(function () { if (!($(this).attr('class').indexOf("_disabled") !== -1)) toggleHomePanels(4); });




    //Wait until UI is loaded then pull an ad into the ad rotator.
    document.getElementById("adblock_iframe").src = "http://flinger.co/ad/";



    //Message send action:
    var sendChatMessage = function () {
        var message = $('#chatBarTextArea').val();
        message = message.replace(/(<([^>]+)>)/ig, "");

        if (message != "") {
            var chatObject;
            try {
                chatObject = BGP.$state.at('chat').get();
            } catch (e) {
                console.log("Warning: Chat object not found.");
            }

            var timeStamp = new Date().getTime();

            BGP.$state.submitOp([{ p: ['chat', chatObject.length], li: { message: message, time: timeStamp, username: BGP.remoteName}}]);

            $('#chatBarTextArea').val('');
        }
    }



    var clearChatLogs = function () {

        clearingChatActive = true;

        var chatObject;
        try {
            chatObject = BGP.$state.at('chat').get();
        } catch (e) {
            console.log("Warning: Chat object not found.");
        }



        for (var i = 0; i < chatObject.length; i++) {
            BGP.$state.submitOp([{ p: ['chat', 0], ld: {}}]);

        }
        chatLogCount = 0;
        clearingChatActive = false;
    }


    $("#chatBarTextArea").keyup(function (e) {
        if (e.keyCode == 13) {
            sendChatMessage();
        }

        var val = $('#chatBarTextArea').val();
        if (val != "") {
            //$("#chat_button").attr("disabled", false);
            $("#chat_button").removeClass("chat_button_disabled");
        } else {
            //$("#chat_button").attr("disabled", true);
            $("#chat_button").addClass("chat_button_disabled");

        }
    })
    .focus();

    $("#chat_button").click(function () {
        $('#chatBarTextArea').blur();
        sendChatMessage();

        $('#chatBarTextArea').focus();
        //$("#chat_button").attr("disabled", true);
        $("#chat_button").addClass("chat_button_disabled");
    });

    //Onload set make sure the chat is scrolled to the bottom.
    var objDiv = document.getElementById("chat_conversation_container");
    objDiv.scrollTop = objDiv.scrollHeight;

    //Make sure none of the inputs are auto focused onload.
    $('input').blur();






    var element = document.createElement('textarea');
    element.id = 'data';
    document.getElementById("home_panel_invite").appendChild(element);

    console.log("Hey! -Felix");

    var data = document.getElementById("data");

    if (document.location.hash && !sessionActive) {
        BGP.docname = document.location.hash.substring(1, 7); // Enter Hashkey - the user's file
        document.getElementById("hash_input").value = BGP.docname;
        connectToHash();
    }

    var textArea = document.getElementById("data");
    var textAreaPrevText = textArea.value;

    document.getElementById("hash_input").onkeypress = alphaFilterKeypress;





    //document.getElementById('connect_button').addEventListener('click', connectToHash);
    //document.getElementById('channel_details_icon').addEventListener('click', disconnectFromHash);

    document.getElementById('hash_input').addEventListener('keydown', pinInputChangeListener);
    document.getElementById('addressBarTextArea').addEventListener('keypress', addressBarChangeListener);
    document.getElementById('search_input_box').addEventListener('keypress', searchBarChangeListener);
    document.getElementById('data').addEventListener('keydown', dataTextAreaChangeListener);



    document.getElementById('fling_uri_button').addEventListener('click', flingURIButton);
    document.getElementById('fling_que_button').addEventListener('click', flingQueButton);

    document.getElementById('muteVideoBtn').addEventListener('click', toggleMute);
    document.getElementById('playVideoBtn').addEventListener('click', playPauseVideo);

    document.getElementById('first_slide_btn').addEventListener('click', firstSlide);
    document.getElementById('prev_slide_btn').addEventListener('click', prevSlide);
    document.getElementById('next_slide_btn').addEventListener('click', nextSlide);
    document.getElementById('last_slide_btn').addEventListener('click', lastSlide);

    document.getElementById('next_Video_btn').addEventListener('click', playNextInQue);
    document.getElementById('next_Video_btn_2').addEventListener('click', playNextInQue);

    document.getElementById('invite_button_fb').addEventListener('click', inviteFacebookButton);
    document.getElementById('invite_button_tw').addEventListener('click', inviteTwitterButton);
    document.getElementById('invite_button_gp').addEventListener('click', inviteGooPlusButton);

    document.getElementById('timeoutMsgCloseBtn').addEventListener('click', timeoutMsgCloseBtn);
    document.getElementById('reconnect_button').addEventListener('click', refreshConnection);



    BGP.timeoutDialogBox = document.getElementById('timeoutMessage');

    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', BGP.trackButtonClick);
    }

    var as = document.querySelectorAll('a');
    for (var i = 0; i < as.length; i++) {
        as[i].addEventListener('click', BGP.trackButtonClick);
    }



    $("#user_name_input").keyup(function (e) {

        var val = $('#user_name_input').val();

        if (e.keyCode == 13) {
            changeUserName();
            document.getElementById("user_name_input").blur();
        }

        if (val == "" || val == BGP.remoteName) {
            document.getElementById("save_username_button").style.display = "none";
        } else {
            document.getElementById("save_username_button").style.display = "block";

        }
    })
    .focus();


    var changeUserName = function () {

        var val = $('#user_name_input').val();
        var val2 = val;
        var dupNum = 0;

        while (BGP.getOnlyRemoteIndex(val) >= 0) {
            dupNum++;
            val = val2 + "_" + dupNum
        }

        if (val == "" || val == BGP.remoteName) {
            console.log("Invalid username input. Username must not be blank and must be different than previous.");
        } else {
            console.log("Changing name to: " + val);
            document.getElementById("user_name_input").value = val;
            var oldName = BGP.remoteName;

            //Change name in current local state.
            BGP.remoteName = val;

            //Change name saved in local storage.
            localStorage.setItem('saved-remote-name', BGP.remoteName);

            //Change name on active remote user list.
            var userIndex = BGP.getRemoteIndex(oldName);
            console.log("user index: " + userIndex);
            if (userIndex >= 0)
                BGP.$state.submitOp([{ p: ['remotes', userIndex], ld: { name: oldName, active: 1 }, li: { name: BGP.remoteName, active: 1}}]);

            //Change name on chat logs.
            var tempChatLog = {};
            try { tempChatLog = JSON.stringify(BGP.$state.at('chat').get()); } catch (e) { }
            var chatObject = JSON.parse(tempChatLog);
            for (var i = 0; i < chatObject.length; i++) {
                if (chatObject[i].username == oldName) {
                    //console.log(chatObject[i].username + ' =? ' + oldName);
                    BGP.$state.submitOp([{ p: ['chat', i], ld: { message: chatObject[i].message, time: chatObject[i].time, username: chatObject[i].username },
                        li: { message: chatObject[i].message, time: chatObject[i].time, username: BGP.remoteName }
                    }]);

                }
            }
        }

        //Toggle buttons disabled status based on result from input.
        if (val == "" || val == BGP.remoteName) {
            document.getElementById("save_username_button").style.display = "none";
        } else {
            document.getElementById("save_username_button").style.display = "block";

        }

    }

    $("#save_username_button").click(function () {
        changeUserName();
        document.getElementById("user_name_input").blur();
    });

    $("#user_name_input").click(function () {
        this.select();
    });

    $("#search_bar_button").click(function () {
        searchYouTube();
    });

    $("#search_input_box").click(function () {
        this.select();
    });





//    $('#up_next_que_container').kinetic({
//        moved: function (state) {
//            //console.log(state);
//        }
//    });
//    $('#main_left_menu').kinetic({
//        moved: function (state) {
//            //console.log(state);
//        }
//    });
//    $('#main_right_menu').kinetic({
//        moved: function (state) {
//            //console.log(state);
//        }
//    });
//    $('#chat_conversation_container').kinetic({
//        moved: function (state) {
//            //console.log(state);
//        }
//    });
    
    
    //$('#left').mousedown(function(){
    //    $('#up_next_que_container').kinetic('start', { velocity: -30 });
    //});
    //$('#left').mouseup(function(){
    //    $('#up_next_que_container').kinetic('end');
    //});
    //$('#right').mousedown(function(){
    //    $('#up_next_que_container').kinetic('start', { velocity: 30 });
    //});
    //$('#right').mouseup(function(){
    //    $('#up_next_que_container').kinetic('end');
    //});


    var timeSlider = document.getElementById("timeSlider_holder");

    //console.log(timeSlider);
    var hammertime = Hammer(timeSlider).on("dragright dragleft", function (ev) {

        //console.log(ev);

        var distance = 0;
        var completeWidth = $(timeComplete).width();
        var timeComplete = document.getElementsByClassName("complete")[0];

        ev.gesture.preventDefault();

        if (ev.gesture.direction == "right")
            distance = ev.gesture.distance * 1
        else if (ev.gesture.direction == "left")
            distance = ev.gesture.distance * -1

        if (distance <= 0 && distance * -1 <= $(timeSlider).width()) {

            if ((distance >= -40 && ev.gesture.direction == "left")) {
                console.log(ev.gesture.direction);
                return;
            }

            $(timeComplete).css({ width: (completeWidth + distance) + "px" });
            //console.log("Dis: " + -1 * distance);
            //console.log("6th: " + threshold);


        }

    });

    //Add notification if fling/que URL param is found.
    BGP.flingUrl = BGP.getUrlParam("fling_url", document.location.href);
    BGP.queueUrl = BGP.getUrlParam("queue_url", document.location.href);
    
    if (BGP.flingUrl.indexOf("youtube.com") !== -1 && getUrlParam("v", document.location.href) != "") {
    	BGP.flingUrl = "http://youtube.com/watch?v=" + getUrlParam("v", document.location.href);
    }
    if (BGP.queueUrl.indexOf("youtube.com") !== -1 && getUrlParam("v", document.location.href) != "") {
    	BGP.queueUrl = "http://youtube.com/watch?v=" + getUrlParam("v", document.location.href);
    }
    
    if (BGP.flingUrl != "" || BGP.queueUrl != "") {
        //console.log("Fling URL found in href: " + BGP.flingUrl);
        if (BGP.flingUrl != "") BGP.flingUrlFound = true;
        if (BGP.queueUrl != "") BGP.queueUrlFound = true;

        //display that the found link will be flung upon connection.
        var queItemDiv = document.createElement("a");
        queItemDiv.id = "que_item_" + "-1";
        queItemDiv.className = "fling_url_param_found_item";

        //queItemDiv.setAttribute("timeStamp", timeStamp);

        var flungByDiv = document.createElement('div');
        flungByDiv.setAttribute('class', "up_next_que_item_user");
        flungByDiv.textContent = 'Connect to a Channel to Fling this.';
        queItemDiv.appendChild(flungByDiv);
        
        BGP.flingUrl = BGP.checkAndCleanUrl(BGP.flingUrl);
        
        if (BGP.flingUrlFound) setQueItemDetails(BGP.flingUrl, queItemDiv);
        else if (BGP.queueUrlFound) setQueItemDetails(BGP.queueUrl, queItemDiv);
        
        $('#fling_url_param_found').append(queItemDiv);
    }

}

//
    var disconnectFromChannel = function () {
        clearTimeout(animationInterval);
        animationInterval = null;
        document.getElementById("connect_button").textContent = "connect";

        document.getElementById("connect_status_icon").style.backgroundImage = "url('images/status_not_connected.png')";
        document.getElementById("connect_status_label").textContent = "Not Paired";
        document.getElementById("connect_status_instr").textContent = "Enter the code found on-screen";

        setTimeout(function () {
            $('#connect_container').fadeIn('slow', function () {
                document.getElementById('connect_container').style.display = "block";
            });
        }, 1);
    };

//Detects browser viewport resize event and then resize UI elements.
$(window).resize(function() {
	makeHomeResponsive();
});

//Handels iOS add to home screen option.
//var addToHomeConfig = {
//	autostart: false
//};

// Tell Safari not to move the window.
function BlockMove(event) {    
    event.preventDefault() ;
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
addLoadEvent(initializeUIElements);

var restoreState = function () {
    if (BGP.prevConnection) {
        connectionSuccess();
        $('#hash_input').blur();
    } else {
        document.getElementById('connect_container').style.display = "block";
        $('#hash_input').focus();
    }

}

//if(pageURl.indexOf("chrome-extension") !== -1) {
    addLoadEvent(restoreState);
//}

var queCount = 0;

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

var addToQue = function (url, timeStamp, username) {

    queCount++;

    var queItemDiv = document.createElement("a");
    queItemDiv.id = "que_item_" + queCount;
    queItemDiv.className = "up_next_que_item";

    queItemDiv.setAttribute("timeStamp", timeStamp);

    var flungByDiv = document.createElement('div');
    flungByDiv.setAttribute('class', "up_next_que_item_user");
    flungByDiv.textContent = 'Flung by ' + username;
    queItemDiv.appendChild(flungByDiv);

    setQueItemDetails(url, queItemDiv);

    $('#up_next_que_container').append(queItemDiv);

    //$("#que_item_" + queCount).click(function () { document.getElementById('home_control_button').click(); BGP.flingURI(url); queCount--; BGP.removeFromQue(timeStamp)});

    var hammertime = Hammer(queItemDiv).on("tap", function (event) {
        //document.getElementById('home_control_button').click();
        BGP.flingURI(url);
        queCount--;

        BGP.removeFromQue(timeStamp);
    });

    var hammertime = Hammer(queItemDiv).on("dragleft", function (ev) {

        var distance = 0;
        var threshold = $(queItemDiv).width() * 0.5;

        ev.gesture.preventDefault();

        if (ev.gesture.direction == "right")
            distance = ev.gesture.distance * 1
        else if (ev.gesture.direction == "left")
            distance = ev.gesture.distance * -1

        if (distance <= 0 && distance * -1 <= $(queItemDiv).width()) {

            if ((distance >= -40 && ev.gesture.direction == "left")) {
                //console.log(ev.gesture.direction);
                return;
            }

            $(queItemDiv).css({ left: distance + "px" });
            //console.log("Dis: " + -1 * distance);
            //console.log("6th: " + threshold);


        }

        //console.log(ev);




    });
    var hammertime = Hammer(queItemDiv).on("release", function (ev) {

        var distance = 0;
        var threshold = $(queItemDiv).width() * 0.5;

        if (ev.gesture.direction == "right")
            distance = ev.gesture.distance * 1
        else if (ev.gesture.direction == "left")
            distance = ev.gesture.distance * -1

        if (distance * -1 <= $(queItemDiv).width()) {



            if (-1 * distance < threshold) {
                $(queItemDiv).animate({ left: "0px" }, 250);

            } else {
                $(queItemDiv).animate({ left: "-" + $(queItemDiv).width() + "px" }, 250, function () {
                    queCount--;

                    BGP.removeFromQue(timeStamp);
                });
            }

        }
        //console.log("Dis: " + -1 * distance);
        //console.log("6th: " + threshold);

    });



}

var playNextInQue = function () {

    if (document.getElementsByClassName('up_next_que_item').length > 0) {

        var url = document.getElementsByClassName('up_next_que_item')[0].getElementsByClassName('up_next_que_item_url')[0].innerHTML;
        var timeStamp = document.getElementsByClassName('up_next_que_item')[0].getAttribute("timeStamp");
        //console.log("!!!! " + timeStamp);
        BGP.flingURI(url);
        queCount--;

        BGP.removeFromQue(timeStamp);

        //document.getElementsByClassName('up_next_que_item')[0].click();
    } else {
        console.log("Nothing was found in the que.");
    }

}


var setQueItemDetails = function (url, queItemDiv) {

    youtube_id = BGP.youtube_parser(url);

    vimeo_id = 0;
    if (url.indexOf("vimeo.com") !== -1) {
        vimeo_id = BGP.vimeo_parser(url);
    }

    if (youtube_id != 0) {
        //Is YouTube URL

        $.getJSON('https://gdata.youtube.com/feeds/api/videos/' + youtube_id + '?v=2&alt=jsonc', function (info) {
            $(queItemDiv).append('<div class="up_next_que_item_title">' + info.data.title + '</div>');
            $(queItemDiv).append('<div class="up_next_que_item_provider">YouTube</div>');
            $(queItemDiv).append('<img src="' + info.data.thumbnail.sqDefault + '" alt="video_tumbnail" class="up_next_que_item_thumb">');
            var viewCount = info.data.viewCount+"";
            viewCount = viewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            var durationTime = secondsToTime(info.data.duration);
            $(queItemDiv).append('<div class="up_next_que_item_details">' +
                                    '<img src="https://plus.google.com/_/favicon?domain=' + 'youtube.com' + '" alt="fav_icon" class="up_next_que_item_favicon2">' +
                                    '<div class="up_next_que_item_views">' + durationTime + '</div>' +
                                    '<img src="images/view_count_icon.png" alt="fav_icon" class="up_next_que_item_favicon2">' +
                                    '<div class="up_next_que_item_views">' + viewCount + '</div>' +
                                 '</div>');
            $(queItemDiv).append('<div class="up_next_que_item_url">' + url + '</div>');
            makeHomeResponsive();
        });

    } else if (url.indexOf("slideshare.net") !== -1) {

        function slideShareCallback(info) {
            $(queItemDiv).append('<div class="up_next_que_item_title">' + info.title + '</div>');
            $(queItemDiv).append('<div class="up_next_que_item_provider">SlideShare</div>');
            $(queItemDiv).append('<img src="http:' + info.thumbnail + '" alt="video_tumbnail" class="up_next_que_item_thumb">');
            var slideCount = info.total_slides+"";
            slideCount = slideCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            $(queItemDiv).append('<div class="up_next_que_item_details">' +
                                    '<img src="https://plus.google.com/_/favicon?domain=' + 'slideshare.net' + '" alt="fav_icon" class="up_next_que_item_favicon2">' +
                                    '<div class="up_next_que_item_views">' + slideCount + ' slides</div>' +
                                 '</div>');
            $(queItemDiv).append('<div class="up_next_que_item_url">' + url + '</div>');
            makeHomeResponsive();
        };
        window["callback_" + queItemDiv.id] = slideShareCallback;

        if (document.getElementById("videoData_" + queItemDiv.id))
            removeElement("videoData_" + queItemDiv.id);

        var gdata = document.createElement("script");
        gdata.src = "https://www.slideshare.net/api/oembed/2?url=" + url + "&format=jsonp&callback=callback_" + queItemDiv.id;
        gdata.id = "videoData_" + queItemDiv.id;
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(gdata);

    } else if (vimeo_id != 0) {

        function vimeoCallback(info) {
            $(queItemDiv).append('<div class="up_next_que_item_title">' + info[0].title + '</div>');
            $(queItemDiv).append('<div class="up_next_que_item_provider">Vimeo</div>');
            $(queItemDiv).append('<img src="' + info[0].thumbnail_medium + '" alt="video_tumbnail" class="up_next_que_item_thumb">');

            var viewCount = info[0].stats_number_of_plays + "";
            viewCount = viewCount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

            var durationTime = secondsToTime(info[0].duration);
            $(queItemDiv).append('<div class="up_next_que_item_details">' +
                                    '<img src="https://plus.google.com/_/favicon?domain=' + 'vimeo.com' + '" alt="fav_icon" class="up_next_que_item_favicon2">' +
                                    '<div class="up_next_que_item_views">' + durationTime + '</div>' +
                                    '<img src="images/view_count_icon.png" alt="fav_icon" class="up_next_que_item_favicon2">' +
                                    '<div class="up_next_que_item_views">' + viewCount + '</div>' +
                                 '</div>');

            $(queItemDiv).append('<div class="up_next_que_item_url">' + url + '</div>');
            makeHomeResponsive();
        };
        window["callback_" + queItemDiv.id] = vimeoCallback;

        if (document.getElementById("videoData_" + queItemDiv.id))
            removeElement("videoData_" + queItemDiv.id);

        var gdata = document.createElement("script");
        gdata.src = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json?callback=callback_" + queItemDiv.id;
        gdata.id = "videoData_" + queItemDiv.id;
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(gdata);

    } else {
        //Is Misc URL


        $(queItemDiv).append('<div class="up_next_que_item_title">' + "Misc Web Link" + '</div>');
        $(queItemDiv).append('<div class="up_next_que_item_provider">iFrame</div>');
        $(queItemDiv).append('<div class="now_playing_video_views"></div>');

        $(queItemDiv).append('<div class="up_next_que_item_details">' + url + '</div>');


        $(queItemDiv).append('<div class="up_next_que_item_favicon_containter"><div class="up_next_que_item_favicon"><img src="https://plus.google.com/_/favicon?domain=' + url + '" alt="fav_icon"></div></div>');
        $(queItemDiv).append('<div class="up_next_que_item_url">' + url + '</div>');
        makeHomeResponsive();

    }

}

var searchResultCount = 0;
var maxSearchResults = 7;
var searchInputQuery = "";

var searchYouTube = function () {

    $('#search_results_container').empty();
    searchInputQuery = document.getElementById("search_input_box").value;

    searchResultCount = 0;

    displayYTSearchResults(searchInputQuery, 1);



};

var addSearchResult = function (index, thumb, title, provider, views, date, url) {

    var searchResultDiv = document.createElement("button");
    searchResultDiv.id = "search_result_" + index;
    searchResultDiv.className = "search_result";

    $(searchResultDiv).append('<img src="' + thumb + '" alt="video_tumbnail" class="search_result_thumb">');
    $(searchResultDiv).append('<div class="search_result_title"><a>' + title + '</a></div>');
    $(searchResultDiv).append('<div class="search_result_provider">' + provider + '</div>');

    $(searchResultDiv).append('<div class="search_result_views">' + views + '</div>');

    $(searchResultDiv).append('<div class="search_result_uploaded">' + date + '</div>');

    $('#search_results_container').append(searchResultDiv);

    //$("#search_result_" + index).click(function () { toggleSearchMenu(); document.getElementById('home_control_button').click(); BGP.flingURI(url); });
    //$("#search_result_" + index).click(function () { /*toggleSearchMenu();*/ 
    //    document.getElementById('home_up_next_button').click(); 
    //    BGP.flingToQue(url); 
    //    $(this).append('<div class="search_result_que_marker"></div>');
    //});

    var hammertime = Hammer(searchResultDiv).on("tap", function (event) {
        //document.getElementById('home_up_next_button').click();
        BGP.flingToQue(url);
        $(this).append('<div class="search_result_que_marker"></div>');
    });


    // Bind the swipeleftHandler callback function to the swipe event on div.box
    //$("#search_result_" + index).on('swipeleft', function(){alert("swipe");});
    //var hammertime = Hammer(searchResultDiv).on("swipeleft", function (event) {
    //    alert('hello!');
    //});
    //var hammertime = Hammer(searchResultDiv).on("dragup", function (event) {
    //    //document.getElementById("#main_right_menu").scrollTop = 320;
    //    scrollDivDown('main_right_menu');
    //});
    //var hammertime = hammer(searchresultdiv).on("dragdown", function (event) {
    //    //document.getelementbyid("#main_right_menu").scrolltop = 320;
    //    scrolldivup('main_right_menu');
    //});
    //var hammertime = Hammer(searchResultDiv, {
    //    drag: false,
    //    transform: false,
    //    drag_block_horizontal: false,
    //    drag_block_vertical: false
    //});
}

var displayYTSearchResults = function(searchInputQuery, startIndex){

    //https://gdata.youtube.com/feeds/api/videos?q=football+-soccer&orderby=published&start-index=11&max-results=10&v=2&alt=json
    $.getJSON('https://gdata.youtube.com/feeds/api/videos?q=' + searchInputQuery  + 
                            '&orderby=relevance&start-index=' + startIndex        + 
                                              '&max-results=' + maxSearchResults + 
                                              '&v=2&alt=json' , function (info) {
        //console.log(info.feed.entry.length);
        for (var i = 0; i < info.feed.entry.length-1; i++) {
            var title = info.feed.entry[i].title.$t,
               vidURL = info.feed.entry[i].link[0].href,
                thumb = info.feed.entry[i].media$group.media$thumbnail[0].url,
                date  = info.feed.entry[i].updated.$t;
             provider = "YouTube";

            var views = 0;
            try{views = info.feed.entry[i].yt$statistics.viewCount}catch(e){views = 0;};
                        
            if(views <= 0) {
                views = "";
            } else {
                views = views.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                views = views + " views";
            }
            date = date.substring(0, 10).replace(/-/g, "/");

            searchResultCount++;
            addSearchResult(searchResultCount, thumb, title, provider, views, date, vidURL);
        }

        

        if (document.getElementById("search_results_more"))
            removeElement("search_results_more");

        var moreSearchResultDiv = document.createElement("button");
        moreSearchResultDiv.id = "search_results_more";
        moreSearchResultDiv.textContent = "more";
        $('#search_results_container').append(moreSearchResultDiv);
        $("#search_results_more").click(function () { displayMoreYTSearchResults(); });


        makeResultTitlesScroll();

    });

}

var displayMoreYTSearchResults = function () {

    var startIndex = searchResultCount + 1;
    displayYTSearchResults(searchInputQuery, startIndex);

}


var makeResultTitlesScroll = function(){

    $('.search_result').unbind('mouseenter mouseleave');

    var scroll_text;
    $('.search_result').hover(
        function () {
            var $elmt = $(this);
            scroll_text = setInterval(function(){scrollText($elmt);}, 20);
        },
        function () {
            clearInterval(scroll_text);
            $(this).find('.search_result_title a').css({
                left: 0
            });
        }
    );
    
    var scrollText = function($elmt){
        var left = $elmt.find('.search_result_title a').position().left - 1;
        left = -left > $elmt.find('.search_result_title a').width() ? $elmt.find('.search_result_title').width() : left;
        $elmt.find('.search_result_title a').css({
            left: left
        });
    };
    
}



Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}




var value;
function checkValue(data){
	value = data;
	console.log(value);	
	//alert(value);
	
	//BGP.queueUrl = value+"";
	//BGP.queueUrlFound = true;
		
	BGP.flingToQue(value);
	
}



