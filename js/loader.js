let appShownFirst = false; // helps to avoid calling update on first show

chrome.devtools.panels.create('Local Storage Explorer', null, 'panel.html', panel => {
    panel.onShown.addListener(function (appWindow) {

        //Call update method
        if (appShownFirst && appWindow.App && appWindow.App.update) {
            appWindow.App.update();
        }

        if(!appShownFirst) {
            appShownFirst = true;
			panel.onSearch.addListener(appWindow.App.handleSearch.bind(appWindow.App));
        }

    });
});