
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

var bodyWidth  = $(window).width();
var bodyHeight = $(window).height();

var prevPanelIndex1 = 1;
var prevPanelIndex2 = 2;

var toggleHomeButtons = function (index) {
    switch (index) {
        case 1:
            $("#home_panel_controls").css("display", "block");
            //$("#home_control_button").attr("disabled", true);
            $("#home_control_button").addClass("home_menu_button_disabled1");
            break;
        case 2:
            $("#home_panel_up_next").css("display", "block");
            //$("#home_up_next_button").attr("disabled", true);
            $("#home_up_next_button").addClass("home_menu_button_disabled2");
            break;
        case 3:
            $("#home_panel_chat").css("display", "block");
            //$("#home_chat_button").attr("disabled", true);
            $("#home_chat_button").addClass("home_menu_button_disabled3");
            break;
        case 4:
            $("#home_panel_invite").css("display", "block");
            //$("#home_invite_button").attr("disabled", true);
            $("#home_invite_button").addClass("home_menu_button_disabled4");
            break;
    }
};

var makeHomeResponsive = function () {

    bodyWidth = $(window).width();
    bodyHeight = $(window).height();

    if (bodyWidth >= 1280) {
        $(".home_panel").width("25%");

        toggleHomeButtons(1); toggleHomeButtons(2);
        toggleHomeButtons(3); toggleHomeButtons(4);

        $("#timeSlider_holder").width((bodyWidth / 4) - 30);

        $("#address_back_bar_1").width((bodyWidth / 4) - 65);
        $("#addressBarTextArea").width((bodyWidth / 4) - 135);

        $("#chat_back_bar_1").width((bodyWidth / 4) - 77);
        $("#chatBarTextArea").width((bodyWidth / 4) - 79);

        $(".up_next_que_item_title").width((bodyWidth / 4) - 110);
        $(".up_next_que_item_details").width((bodyWidth / 4) - 110);
        $(".up_next_que_item_url").width((bodyWidth / 4) - 32);

    } else if (bodyWidth < 1280 && bodyWidth >= 640) {
        $(".home_panel").width("50%");

        if (!$("input").is(":focus"))
            $(".home_panel").css("display", "none");
        //$(".home_menu_button").attr("disabled", false);
        $(".home_menu_button").removeClass("home_menu_button_disabled1");
        $(".home_menu_button").removeClass("home_menu_button_disabled2");
        $(".home_menu_button").removeClass("home_menu_button_disabled3");
        $(".home_menu_button").removeClass("home_menu_button_disabled4");

        toggleHomeButtons(prevPanelIndex1);
        toggleHomeButtons(prevPanelIndex2);

        $("#timeSlider_holder").width((bodyWidth / 2) - 30);

        $("#address_back_bar_1").width((bodyWidth / 2) - 65);
        $("#addressBarTextArea").width((bodyWidth / 2) - 135);

        $("#chat_back_bar_1").width((bodyWidth / 2) - 77);
        $("#chatBarTextArea").width((bodyWidth / 2) - 79);

        $(".up_next_que_item_title").width((bodyWidth / 2) - 110);
        $(".up_next_que_item_details").width((bodyWidth / 2) - 110);
        $(".up_next_que_item_url").width((bodyWidth / 2) - 32);

    } else if (bodyWidth < 640) {

        if (bodyWidth < 320) { bodyWidth = 320; }

        $(".home_panel").width("100%");

        if (!$("input").is(":focus"))
            $(".home_panel").css("display", "none");

        if (!$("input").is(":focus")) {
            //$(".home_menu_button").attr("disabled", false);
            $(".home_menu_button").removeClass("home_menu_button_disabled1");
            $(".home_menu_button").removeClass("home_menu_button_disabled2");
            $(".home_menu_button").removeClass("home_menu_button_disabled3");
            $(".home_menu_button").removeClass("home_menu_button_disabled4");

            if (prevPanelIndex1 < prevPanelIndex2) {
                toggleHomeButtons(prevPanelIndex1);
            } else { toggleHomeButtons(prevPanelIndex2); }
        }


        $("#timeSlider_holder").width(bodyWidth - 30);

        $("#address_back_bar_1").width(bodyWidth - 65);
        $("#addressBarTextArea").width(bodyWidth - 135);

        $("#chat_back_bar_1").width(bodyWidth - 77);
        $("#chatBarTextArea").width(bodyWidth - 79);

        $(".up_next_que_item_title").width(bodyWidth - 110);
        $(".up_next_que_item_details").width(bodyWidth - 110);
        $(".up_next_que_item_url").width(bodyWidth - 32);
    }




    if (bodyHeight < 480) {
        document.getElementById("ad_block").style.display = "none";
    } else {
        document.getElementById("ad_block").style.display = "block";
    }


    if (bodyHeight > 320) {
        $("#up_next_que_container").height(bodyHeight - 90);

    }

    $("#chat_conversation_container").height(bodyHeight - 135);

    //On resize set make sure the chat is scrolled to the bottom.
    var objDiv = document.getElementById("chat_conversation_container");
    objDiv.scrollTop = objDiv.scrollHeight;


    //Keep complete time slider at correct size on a resize event.
    seekBarWidth = document.getElementById("timeSlider").clientWidth;
    completedWidth = ((currentTime * (seekBarWidth - 0)) / totalTime).toFixed(3);
    document.getElementById("timeSlider").getElementsByClassName('complete')[0].style.width = completedWidth + "px";
    document.getElementById("timeSlider").getElementsByClassName('marker')[0].style.left = completedWidth + "px";




    if ($(window).height() < 455 && $(window).height() >= 320) {
        document.getElementsByClassName("booms")[0].style.top = ($(window).height() - 455) + 75 + "px";
        document.getElementsByClassName("booms")[1].style.top = ($(window).height() - 455) + 75 + "px";
        document.getElementsByClassName("booms")[2].style.top = ($(window).height() - 455) + 75 + "px";
        document.getElementById("flinger_co_text_logo").style.top = ($(window).height() - 455) + 260 + "px";
    } else if ($(window).height() < 390) {
        document.getElementsByClassName("booms")[0].style.top = (390 - 455) + 75 + "px";
        document.getElementsByClassName("booms")[1].style.top = (390 - 455) + 75 + "px";
        document.getElementsByClassName("booms")[2].style.top = (390 - 455) + 75 + "px";
        document.getElementById("flinger_co_text_logo").style.top = (390 - 455) + 260 + "px";
    } if ($(window).height() >= 455) {
        document.getElementsByClassName("booms")[0].style.top = ($(window).height() / 2 - 180) + 0 + "px";
        document.getElementsByClassName("booms")[1].style.top = ($(window).height() / 2 - 180) + 0 + "px";
        document.getElementsByClassName("booms")[2].style.top = ($(window).height() / 2 - 180) + 0 + "px";
        document.getElementById("flinger_co_text_logo").style.top = ($(window).height() / 2 - 180) + 185 + "px";
    }

    if ($(window).height() < 340) {
        document.getElementById("connect_status_instr").style.display = "none";
        document.getElementById("flinger_co_text_logo").style.display = "none";
    } else {
        document.getElementById("connect_status_instr").style.display = "inline-block";
        document.getElementById("flinger_co_text_logo").style.display = "inline-block";
    }








};