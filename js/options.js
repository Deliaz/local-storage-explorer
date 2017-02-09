class Options {
    constructor() {
        this.settings = {};
        this.el = {};
    }

    init() {
        this.selectElements();
        this.showHeader();
        this.loadSettings();
        this.showSettings();
        this.startHandlers();
    }

    selectElements() {
        let qs = document.querySelector.bind(document);

        this.el = {
            storageSelect: qs('.js-select-storage'),
            themeSelect: qs('.js-select-theme'),
            saveBtn: qs('.js-save-button'),
            header: qs('.js-options-header')
        }
    }


    /**
     * Show main header if 'show_header' flag set in url
     */
    showHeader() {
        if(window.location.search.includes('show_header')) {
            this.el.header.classList.remove('b-container__main-header_hidden');
        }
    }

    /**
     * Load saved settings of set defaults instead
     */
    loadSettings() {
        this.settings = {
            theme: localStorage.getItem('theme') || DEFAULT_THEME_NAME,
            storage: localStorage.getItem('storage') || DEFAULT_STORAGE
        };
    }


    /**
     * Show loaded settings in UI
     */
    showSettings() {
        this.el.storageSelect.value = this.settings.storage;
        this.el.themeSelect.value = this.settings.theme;
    }

    startHandlers() {

        this.el.saveBtn.addEventListener('click', () => {
            this.settings = {
                storage: this.el.storageSelect[this.el.storageSelect.selectedIndex].value,
                theme: this.el.themeSelect[this.el.themeSelect.selectedIndex].value,
            };

            // Save storage
            localStorage.setItem('storage', this.settings.storage);
            localStorage.setItem('theme', this.settings.theme);


            // Animate button
            this.el.saveBtn.setAttribute('disabled', 'disabled');
            this.el.saveBtn.innerText = 'Saved';
            if (this.el.saveBtn.dataset.buttonTimer) {
                clearTimeout(this.el.saveBtn.dataset.buttonTimer);
                this.el.saveBtn.classList.remove('b-options__button-save_animated');
            }

            this.el.saveBtn.classList.add('b-options__button-save_animated');
            this.el.saveBtn.dataset.buttonTimer = setTimeout(() => {
                this.el.saveBtn.classList.remove('b-options__button-save_animated');
                this.el.saveBtn.removeAttribute('disabled');
                this.el.saveBtn.innerText = 'Save';
            }, BTN_HIGHLIGHT_TIMEOUT);
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    let optionsInstance = new Options();
    optionsInstance.init();
});