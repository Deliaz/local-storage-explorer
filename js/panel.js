/**
 * Application class for DevTools panel
 */
class WebStorageExplorer {
    constructor() {
        this.storageDriver = new StorageDriver();
        this.storage = new Map();
        this.constants = {};
        this.el = {};
        this.settings = {};
        this.currentStorageName = DEFAULT_STORAGE;

        this.isNavFloating = false;
        this.lastShownKey = '';
        this.loadedByUpdate = false;
        this.lastShownKeyIndex = -1;
    }

    init() {
        this.loadSettings();
        this.selectElements();
        this.retrieveStorage(this.currentStorageName);

        this.setHandlers();
        this.createConstants();
        this.updateUI();
    }

    loadSettings() {
        this.currentStorageName = localStorage.getItem('storage') || DEFAULT_STORAGE;
    }

    selectElements() {
        this.el = {
            body: $('body'),
            window: $(window),
            linkTheme: $('.js-link-theme'),

            valueView: $('.js-value-view'),
            initialText: $('.js-initial-text'),

            keyList: $('.js-key-list'),
            selectStorage: $('.js-select-storage'),
            reloadBtn: $('.js-reload-btn'),
            removeBtn: $('.js-remove-btn'),
            showNavBtn: $('.js-show-nav'),
            pageOverlay: $('.js-page-overlay'),
            navBlock: $('.js-nav-block'),
            showSubnavBtn: $('.js-show-subnav'),
            subnavMenu: $('.js-subnav-menu'),
            footer: $('.js-footer'),
            valueInfo: $('.js-value-info'),
            optionsPageBtn: $('.js-options-page-button'),

            clearStorageBtn: $('.js-clear-storage-button'),
            clearStorageConfirmBtn: $('.js-clear-storage-confirm-button'),
            
            jsonViewTools: $('.js-json-view-tools')
        }
    }

    getStorageInfo() {
        this.storageDriver.getStoragesInfo(this.showStorageInfo.bind(this));
    }

    showStorageInfo(storageInfo) {
        try {
            let parsedInfo = JSON.parse(storageInfo);

            if (typeof parsedInfo.ls !== 'undefined' && typeof parsedInfo.ss !== 'undefined') {
                let lsOption = this.el.selectStorage.find('option[value="localStorage"]');
                let ssOption = this.el.selectStorage.find('option[value="sessionStorage"]');

                lsOption.text(`localStorage [${parsedInfo.ls}]`);
                ssOption.text(`sessionStorage [${parsedInfo.ss}]`);
            }
        } catch (e) {
            console.error(e)
        }
    }

    retrieveStorage(storageType) {
        this.getStorageInfo();
        this.currentStorageName = ['localStorage', 'sessionStorage'].indexOf(storageType) !== -1 ? storageType : 'localStorage';

        this.startLoadTime = performance.now();
        this.storageDriver.getStorageByName(this.currentStorageName, this.parseStorage.bind(this));
    }

    removeKeyFromStorage(key) {
        if (this.storage.has(key)) {
            this.storageDriver.removeKey(this.currentStorageName, key);
        }
    }

    parseStorage(stringStorage) {
        try {
            let parsedStorage = JSON.parse(stringStorage);
            this.keyList = Object.keys(parsedStorage);

            if (this.keyList.length) {
                this.keyList.forEach(key => {
                    let rawValue = parsedStorage[key];
                    let parsedValue = WebStorageExplorer.tryParseJSON(rawValue);
                    parsedValue = parsedValue ? parsedValue : rawValue;

                    this.storage.set(key,{
                        value: parsedValue,
                        len: rawValue.length,
                        type: WebStorageExplorer.guessType(parsedValue)
                    });
                });

                this.renderStorageKeys()
            } else {
                this.clear();
            }

            this.onAfterParse();
        } catch (e) {
            console.error('Cannot parse storage: ', e);
        }
    }


    renderStorageKeys() {
        let linksTemplate = this.keyList.reduce((tpl, key) => {
            tpl += `
            <li class="b-keys-menu__item">
                <a href="#!" class="b-keys-menu__link js-select-key" data-key="${key}" title="${key}">
                    <i class="fa fa-${ICON_TYPE[this.storage.get(key).type]} b-keys-menu__type-icon"></i>
                    <span>${key}</span>
                </a>
            </li>
            `;

            return tpl;
        }, '');

        this.el.keyList.html(linksTemplate);

        this.onAfterRender();
    }


    onAfterRender() {
        this.updateFooterPosition();
        this.checkForLastKey();
    }

    onAfterParse() {
        this.showInitialText();
    }

    onAfterShowKey() {
        this.el.initialText.hide();
    }


    showInitialText() {
        if(!this.lastShownKey) {
            if(this.storage.size) {
                let loadTime = performance.now() - this.startLoadTime;
                this.el.initialText.text(`loaded ${this.storage.size} items in ${loadTime.toFixed(1)}ms`);
            } else {
                this.el.initialText.text(`${this.currentStorageName} is empty`);
            }
            this.el.initialText.show();
        } else {
            this.el.initialText.hide();
        }
    }


    setHandlers() {
        let self = this;

        this.el.keyList.on('click', '.js-select-key', function (e) {
            e.preventDefault();

            $('.js-select-key').removeClass('b-keys-menu__link_active');
            $(this).addClass('b-keys-menu__link_active');

            let key = $(this).data('key');

            self.showValueForKey(key);
            if (self.isNavFloating) {
                self.toggleNavView();
            }

            self.lastShownKeyIndex = self.keyList.indexOf(key);
        });

        this.el.selectStorage.on('change', e => {
            let storageType = $(e.target).val();

            this.clear();
            this.lastShownKey = '';
            this.retrieveStorage(storageType);
        });

        this.el.reloadBtn.on('click', e => {
            e.preventDefault();

            this.clear(true);
            this.update();
        });

        this.el.removeBtn.on('click', e => {
            e.preventDefault();

            if(this.lastShownKey !== '') {
                this.removeKeyFromStorage(this.lastShownKey);

                this.lastShownKey = '';

                this.clear(true);
                this.update();
            }
        });

        this.el.showNavBtn.on('click', e => {
            e.preventDefault();
            this.toggleNavView();
        });

        this.el.pageOverlay.on('click', () => {
            this.toggleNavView();
        });

        this.el.showSubnavBtn
            .on('click', function (e) {
                self.el.subnavMenu.toggleClass('b-subnav-menu_shown');
                $(this).toggleClass('b-header__header-btn_active');

                return false;
            })
            .on(':hide', function() {
                self.el.subnavMenu.removeClass('b-subnav-menu_shown');
                $(this).removeClass('b-header__header-btn_active');
            });

        this.el.window.on('resize', () => {
            this.updateFooterPosition();
        });

        this.el.clearStorageBtn.on('click', e => {
            e.preventDefault();
            this.el.clearStorageBtn.toggleClass('b-subnav-menu__link_activated');

            this.el.clearStorageBtn.on('blur', () => {
                this.el.clearStorageBtn
                    .off('blur')
                    .removeClass('b-subnav-menu__link_activated');
            });
        });

        this.el.clearStorageConfirmBtn.on('click', e => {
            e.preventDefault();
            this.storageDriver.clearStorage(this.currentStorageName);
            this.el.showSubnavBtn.trigger(':hide');

            this.clear();
            this.update();
        });

        this.el.body.on('click', e => {
            if (!$.contains(this.el.showSubnavBtn[0], e.target) || e.target === this.el.showSubnavBtn[0]) {
                if(!$.contains(this.el.subnavMenu[0], e.target) && this.el.subnavMenu.is('.b-subnav-menu_shown')) {
                    this.el.showSubnavBtn.trigger(':hide');
                }
            }
        });


        this.el.optionsPageBtn.on('click', e => {
            e.preventDefault();
            this.el.showSubnavBtn.trigger(':hide');

            window.open(chrome.runtime.getURL('options.html?show_header'));
        });

        // Open links from json view in a new tab
        this.el.valueView.on('click', 'a[href]', function(e) {
            e.preventDefault();
            let href = $(this).attr('href');
            window.open(href);
        });
        
        this.el.jsonViewTools.on('click', 'button', function(e) {
            let $thisBtn = $(this);

            switch($thisBtn.data('jsonViewAction').toLowerCase()) {
                case 'collapse':
                    self.el.valueView.JSONView('collapse');
                    break;
                case 'expand':
                    self.el.valueView.JSONView('expand');
                    break;
                case 'toggle':
                    self.el.valueView.JSONView('toggle', $thisBtn.data('jsonViewLevel') || 1);
                    break;
            }
        });
    }

    createConstants() {
        this.constants.footerHeight = this.el.footer.outerHeight(true);
        this.constants.storageSelectHeight = this.el.selectStorage.outerHeight(true);
        Object.freeze(this.constants);
    }

    updateUI() {
        this.el.selectStorage.val(this.currentStorageName);
    }

    update() {
        this.loadedByUpdate = true;
        this.retrieveStorage(this.currentStorageName);
    }

    toggleNavView() {
        this.el.navBlock.toggleClass('b-nav_shown');
        this.el.pageOverlay.toggleClass('b-page-overlay_hidden');

        this.isNavFloating = this.el.navBlock.hasClass('b-nav_shown');
    }

    clear(shouldSaveLastShownKey=false) {
        this.storage.clear();

        if(!shouldSaveLastShownKey) {
            this.lastShownKey = '';
            this.lastShownKeyIndex = -1;
        }

        this.el.keyList.empty();
        this.el.valueView.empty();
        this.el.valueInfo.empty();
    }

    showValueForKey(key) {
        let val = this.storage.get(key).value;
        this.el.valueView.parent().scrollTop(0);

        if (typeof val === "object") {
            this.el.valueView
                .JSONView(val, {collapsed: false})
                .addClass('b-value-view__with-tools');
            this.el.jsonViewTools.removeClass('b-json-view-tools_hidden');
        } else {
            this.el.valueView
                .removeClass('b-value-view__with-tools')
                .text(val);
            this.el.jsonViewTools.addClass('b-json-view-tools_hidden');
        }

        this.lastShownKey = key;

        this.showInfoForValue(key);
        this.onAfterShowKey();
    }

    showInfoForValue(key) {
        let val = this.storage.get(key);
        let infoString = `
            <span class="b-value-info__property">Type: <b>${val.type}</b></span>
            <span class="b-value-info__property">Length: <b>${val.len}</b></span>
        `;

        this.el.valueInfo.html(infoString);
    }

    checkForLastKey() {
        if (this.loadedByUpdate) {
            this.loadedByUpdate = false;

            if (this.lastShownKey) {
                this.tryToShowLastKey();
            } else {
                this.tryToSelectNextKey();
            }
        } else {
        }
    }

    tryToShowLastKey() {
        if (this.lastShownKey && this.storage.has(this.lastShownKey)) {
            this.showValueForKey(this.lastShownKey);
            $(`.js-select-key[data-key="${this.lastShownKey}"]`).toggleClass('b-keys-menu__link_active');
        }
    }

    tryToSelectNextKey() {
        if (this.lastShownKeyIndex !== -1 && this.keyList.length) {
            this.lastShownKeyIndex -= this.lastShownKeyIndex <= this.keyList.length - 1 ? 0 : 1;
            let key = this.keyList[this.lastShownKeyIndex];
            this.showValueForKey(key);
            $(`.js-select-key[data-key="${key}"]`).toggleClass('b-keys-menu__link_active');
        }
    }

    updateFooterPosition() {
        if (this.el.keyList.height() >= this.el.window.height() - this.constants.footerHeight - this.constants.storageSelectHeight) {
            this.el.footer.addClass('b-nav-footer_no-bottom');
        } else {
            this.el.footer.removeClass('b-nav-footer_no-bottom');
        }
    }

	/**
	 * Public function when search on search event in devtools
	 * @param action {string} Performed action
	 * @param keyword {string} Searched keyword
	 */
	handleSearch(action, keyword) {
		this.el.valueView.unmark();
		switch (action) {
			case 'performSearch':
				this.el.valueView.mark(keyword);
				break;
			case 'cancelSearch':
				// no action needed because marks already was cleared: see line 1 of this function
				break;
		}
	}

    static tryParseJSON(strJSON) {
        let res;
        try {
            res = JSON.parse(strJSON);
        } catch (err) {
            res = null;
        }

        return res;
    }

    static guessType(val) {
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                return 'array';
            }
            if (val === null) {
                return 'null';
            }
            return 'object';
        }

        if (!isNaN(parseFloat(val)) && isFinite(val)) {
            return 'number';
        }

        if (typeof val === 'boolean') {
            return 'boolean';
        }

        if (typeof val === 'string') {
            return 'string';
        }

        return 'other';
    }
}

// Tiny UMD
if(typeof exports !== 'undefined') {
    module.exports = WebStorageExplorer;
} else {
    $(document).ready(() => {
        let App = new WebStorageExplorer();
        window.App = App;
        App.init();
    });
}