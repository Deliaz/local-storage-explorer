class Options {
    constructor() {
        this.settings = {};
        this.el = {};
    }

    init() {
        this.selectElements();
        this.loadSettings();
        this.showSettings();
        this.startHandlers();
    }

    selectElements() {
        let qs = document.querySelector.bind(document);

        this.el = {
            storageSelect: qs('.js-select-storage'),
            themeSelect: qs('.js-select-theme'),
            saveBtn: qs('.js-save-button')
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