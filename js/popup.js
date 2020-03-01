document.addEventListener('DOMContentLoaded', () => {
    const kbdEl = document.querySelector('.shortcut');
    if(!kbdEl) {
        return;
    }

    if(navigator.platform.indexOf('Mac') > -1) {
        kbdEl.innerText = 'Command+Option+I';
    } else {
        kbdEl.innerText = 'Control+Shift+I';
    }
});