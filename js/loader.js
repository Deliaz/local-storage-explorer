let appShownFirst = false; // helps to avoid calling update on first show

chrome.devtools.panels.create("Web Storage Explorer", null, "panel.html", panel => {
    panel.onShown.addListener(function (appWindow) {

        //Call update method
        if (appShownFirst && appWindow.App && appWindow.App.update) {
            appWindow.App.update();
        }

        if(!appShownFirst) {
            appShownFirst = true;
        }

    });
});