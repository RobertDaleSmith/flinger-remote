var flingPage = function () {
    var thisUrl = document.location.href;
    window.open('http://remote.flinger.co/?fling_url=' + thisUrl, 'flinger', 'toolbar=no,width=700,height=570');

};
flingPage();
