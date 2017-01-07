const LINK_TAG_SELECTOR = '.js-link-theme';

(() => {
    let themeName = localStorage.getItem('theme');
    let themeURL = chrome.runtime.getURL(`css/theme/${themeName || DEFAULT_THEME_NAME}.css`);
    let linkElement = document.querySelector(LINK_TAG_SELECTOR);

    if(linkElement) {
        linkElement.setAttribute('href', themeURL);
    } else {
        console.error('Style tag not found');
    }
})();