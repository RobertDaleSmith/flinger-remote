var bodyWidth  = $(window).width();
var bodyHeight = $(window).height();

$(window).resize(function() {
	makeMainResponsive();
});

var makeMainResponsive = function () {

    bodyWidth = $(window).width();
    bodyHeight = $(window).height();
    var pageURl = window.location.href;

    //Welcome Page --Start
    if (bodyWidth > 1095) {
        document.getElementById('header_container').style.left = 122 + "px";

        document.getElementById('intro_container').style.left = 122 + "px";
        document.getElementById('intro_container').style.top = 150 + "px";
        document.getElementById('intro_container').style.width = 640 + "px";
        document.getElementById('intro_container').style.height = 300 + "px";

        document.getElementById('hashtag_input').style.width = 271 + "px";
        document.getElementById('disconnect_button').style.left = 218 + "px";
        document.getElementById('connect_button').style.left = 243 + "px";
        document.getElementById('intro_1_text').style.fontSize = 20 + "px";
        document.getElementById('intro_2_text').style.fontSize = 20 + "px";
        document.getElementById('intro_2_text').innerHTML = "Enter the 6 digit code that appears on your TV's browser";
        document.getElementById('intro_tv_url').style.fontSize = 30 + "px";
        document.getElementById('loaderImage').style.left = 355 + "px";

        document.getElementById('fling_button').style.top = 64 + "px";
        document.getElementById('addressBarTextArea').style.width = 550 + "px";

        document.getElementById('timeSlider').style.width = 375 + "px";
        document.getElementById('timeSlider_holder').style.bottom = 30 + "px";
        document.getElementById('timeSlider_holder').style.left = 75 + "px";
        document.getElementById('timer_duration_holder').style.left = 75 + "px";
        document.getElementById('timer_duration_holder').style.bottom = 25 + "px";
        document.getElementById('timer_duration_holder').style.width = 375 + "px";




        document.getElementById('control_container').style.top = 460 + "px";
        document.getElementById('control_container').style.left = 122 + "px";
        document.getElementById('control_container').style.width = 640 + "px";
        document.getElementById('control_container').style.height = 200 + "px";

        document.getElementById('channel_info_container').style.left = 770 + "px";
        document.getElementById('channel_info_container').style.top = 150 + "px";

        document.getElementById('ad_block').style.left = 770 + "px";
        document.getElementById('ad_block').style.top = 90 + "px";

        document.getElementById('video_info_container').style.left = 770 + "px";
        document.getElementById('video_info_container').style.top = 360 + "px";

        document.getElementById('header_title').style.fontSize = 55 + "px";
        document.getElementById('header_logo').style.width = 128 + "px";
        document.getElementById('header_logo').style.height = 128 + "px";
        document.getElementById('header_logo').style.backgroundImage = "url(icon_128.png)";

        if (!(pageURl.indexOf("chrome-extension") !== -1)) {
            document.getElementById('bookmarklet_container').style.top = 25 + "px";
            document.getElementById('bookmarklet_container').style.right = 25 + "px";
            document.getElementById('bookmarklet_container').style.left = "";
        }

    } else if (bodyWidth <= 1095 && bodyWidth > 995) {
        document.getElementById('header_container').style.left = 10 + "px";
        document.getElementById('header_container').style.top = 10 + "px";

        document.getElementById('intro_container').style.left = 10 + "px";
        document.getElementById('intro_container').style.top = 150 + "px";
        document.getElementById('intro_container').style.width = 640 + "px";
        document.getElementById('intro_container').style.height = 300 + "px";

        document.getElementById('hashtag_input').style.width = 271 + "px";
        document.getElementById('disconnect_button').style.left = 218 + "px";
        document.getElementById('connect_button').style.left = 243 + "px";
        document.getElementById('intro_1_text').style.fontSize = 20 + "px";
        document.getElementById('intro_2_text').style.fontSize = 20 + "px";
        document.getElementById('intro_2_text').innerHTML = "Enter the 6 digit code that appears on your TV's browser";
        document.getElementById('intro_tv_url').style.fontSize = 30 + "px";
        document.getElementById('loaderImage').style.left = 355 + "px";

        document.getElementById('fling_button').style.top = 64 + "px";
        document.getElementById('addressBarTextArea').style.width = 550 + "px";


        document.getElementById('timeSlider').style.width = 375 + "px";
        document.getElementById('timeSlider_holder').style.bottom = 30 + "px";
        document.getElementById('timeSlider_holder').style.left = 75 + "px";
        document.getElementById('timer_duration_holder').style.left = 75 + "px";
        document.getElementById('timer_duration_holder').style.bottom = 25 + "px";
        document.getElementById('timer_duration_holder').style.width = 375 + "px";




        document.getElementById('control_container').style.top = 460 + "px";
        document.getElementById('control_container').style.left = 10 + "px";
        document.getElementById('control_container').style.width = 640 + "px";
        document.getElementById('control_container').style.height = 200 + "px";

        document.getElementById('channel_info_container').style.left = 658 + "px";
        document.getElementById('channel_info_container').style.top = 150 + "px";

        document.getElementById('ad_block').style.left = 658 + "px";
        document.getElementById('ad_block').style.top = 90 + "px";

        document.getElementById('video_info_container').style.left = 658 + "px";
        document.getElementById('video_info_container').style.top = 360 + "px";

        document.getElementById('header_title').style.fontSize = 55 + "px";
        document.getElementById('header_logo').style.width = 128 + "px";
        document.getElementById('header_logo').style.height = 128 + "px";
        document.getElementById('header_logo').style.backgroundImage = "url(icon_128.png)";

        if (!(pageURl.indexOf("chrome-extension") !== -1)) {
            document.getElementById('bookmarklet_container').style.top = 25 + "px";
            document.getElementById('bookmarklet_container').style.right = 25 + "px";
            document.getElementById('bookmarklet_container').style.left = "";
        }

    } else if (bodyWidth <= 995 && bodyWidth > 640) {
        document.getElementById('header_container').style.left = 10 + "px";
        document.getElementById('header_container').style.top = 10 + "px";

        document.getElementById('intro_container').style.left = 10 + "px";
        document.getElementById('intro_container').style.top = 50 + "px";
        document.getElementById('intro_container').style.width = 320 + "px";
        document.getElementById('intro_container').style.height = 275 + "px";

        document.getElementById('hashtag_input').style.width = 210 + "px";
        document.getElementById('disconnect_button').style.left = 156 + "px";
        document.getElementById('connect_button').style.left = 181 + "px";
        document.getElementById('intro_1_text').style.fontSize = 16 + "px";
        document.getElementById('intro_2_text').style.fontSize = 16 + "px";
        document.getElementById('intro_2_text').innerHTML = "Enter the 6 digit code on-screen";
        document.getElementById('intro_tv_url').style.fontSize = 20 + "px";
        document.getElementById('loaderImage').style.left = 12 + "px";

        document.getElementById('fling_button').style.top = 8 + "px";
        document.getElementById('addressBarTextArea').style.width = 285 + "px";


        document.getElementById('timeSlider').style.width = 290 + "px";
        document.getElementById('timeSlider_holder').style.bottom = 85 + "px";
        document.getElementById('timeSlider_holder').style.left = 15 + "px";
        document.getElementById('timer_duration_holder').style.left = 15 + "px";
        document.getElementById('timer_duration_holder').style.bottom = 80 + "px";
        document.getElementById('timer_duration_holder').style.width = 290 + "px";


        document.getElementById('control_container').style.top = 335 + "px";
        document.getElementById('control_container').style.left = 10 + "px";
        document.getElementById('control_container').style.width = 320 + "px";
        document.getElementById('control_container').style.height = 225 + "px";

        document.getElementById('channel_info_container').style.left = 338 + "px";
        document.getElementById('channel_info_container').style.top = 50 + "px";

        document.getElementById('ad_block').style.left = 338 + "px";
        document.getElementById('ad_block').style.top = 0 + "px";

        document.getElementById('video_info_container').style.left = 338 + "px";
        document.getElementById('video_info_container').style.top = 260 + "px";

        document.getElementById('header_title').style.fontSize = 30 + "px";
        document.getElementById('header_logo').style.width = 32 + "px";
        document.getElementById('header_logo').style.height = 32 + "px";
        document.getElementById('header_logo').style.backgroundImage = "url(fav-icon-32.png)";

        if (!(pageURl.indexOf("chrome-extension") !== -1)) {
            document.getElementById('bookmarklet_container').style.top = 580 + "px";
            document.getElementById('bookmarklet_container').style.right = "";
            document.getElementById('bookmarklet_container').style.left = 10 + "px";
        }

    } else if (bodyWidth <= 640) {
        document.getElementById('header_container').style.left = 10 + "px";
        document.getElementById('header_container').style.top = 60 + "px";

        document.getElementById('intro_container').style.left = 0 + "px";
        document.getElementById('intro_container').style.top = 100 + "px";
        document.getElementById('intro_container').style.width = 320 + "px";
        document.getElementById('intro_container').style.height = 275 + "px";

        document.getElementById('hashtag_input').style.width = 210 + "px";
        document.getElementById('disconnect_button').style.left = 156 + "px";
        document.getElementById('connect_button').style.left = 181 + "px";
        document.getElementById('intro_1_text').style.fontSize = 16 + "px";
        document.getElementById('intro_2_text').style.fontSize = 16 + "px";
        document.getElementById('intro_2_text').innerHTML = "Enter the 6 digit code on-screen";
        document.getElementById('intro_tv_url').style.fontSize = 20 + "px";
        document.getElementById('loaderImage').style.left = 12 + "px";

        document.getElementById('fling_button').style.top = 8 + "px";
        document.getElementById('addressBarTextArea').style.width = 285 + "px";


        document.getElementById('timeSlider').style.width = 290 + "px";
        document.getElementById('timeSlider_holder').style.bottom = 85 + "px";
        document.getElementById('timeSlider_holder').style.left = 15 + "px";
        document.getElementById('timer_duration_holder').style.left = 15 + "px";
        document.getElementById('timer_duration_holder').style.bottom = 80 + "px";
        document.getElementById('timer_duration_holder').style.width = 290 + "px";


        document.getElementById('control_container').style.top = 385 + "px";
        document.getElementById('control_container').style.left = 0 + "px";
        document.getElementById('control_container').style.width = 320 + "px";
        document.getElementById('control_container').style.height = 225 + "px";

        document.getElementById('channel_info_container').style.left = 0 + "px";
        document.getElementById('channel_info_container').style.top = 620 + "px";

        document.getElementById('ad_block').style.left = 0 + "px";
        document.getElementById('ad_block').style.top = 0 + "px";

        document.getElementById('video_info_container').style.left = 0 + "px";
        document.getElementById('video_info_container').style.top = 830 + "px";


        document.getElementById('header_title').style.fontSize = 30 + "px";
        document.getElementById('header_logo').style.width = 32 + "px";
        document.getElementById('header_logo').style.height = 32 + "px";
        document.getElementById('header_logo').style.backgroundImage = "url(fav-icon-32.png)";


        if (!(pageURl.indexOf("chrome-extension") !== -1)) {
            document.getElementById('bookmarklet_container').style.top = 1142 + "px";
            document.getElementById('bookmarklet_container').style.right = "";
            document.getElementById('bookmarklet_container').style.left = 10 + "px";
        }
        else { 
            document.getElementById('body').style.width =  320 + "px";
            document.getElementById('body').style.height = 377 + "px";        
        }

    }

}