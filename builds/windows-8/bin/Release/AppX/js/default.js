﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var sampleTitle = "Flinger";

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                //document.getElementById("contentHost").innerText = "This app demonstrates how to receive content in Windows 8 as a share target.  To try it, share from an app that supports share, such as Internet Explorer 10 or the Share Source sample app, and select the Share Target Sample app from the share pane.";
            }));
        }
    }

           
    

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle
    });

    WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();


})();
