/**
 * Created by deliaz on 11/09/16.
 */
class StorageDriver {
    constructor() {

    }

    getStoragesInfo(callback) {
        let extractString = '(function() {return JSON.stringify({ls: localStorage.length, ss: sessionStorage.length});})();';

        chrome.devtools.inspectedWindow.eval(extractString, (stringResult, isException) => {
            if (!isException) {
                callback(stringResult);
            } else {
                console.error(isException);
            }
        });
    }

    getStorageByName(name, callback) {
        let extractString = `(function() {return JSON.stringify(${name});})();`;

        chrome.devtools.inspectedWindow.eval(extractString, (stringResult, isException) => {
            if (!isException) {
                callback(stringResult);
            } else {
                console.error(isException);
            }
        });
    }

    removeKey(storageName, keyName) {
        let deleteString = `(function() {${storageName}.removeItem('${keyName}');})();`;

        chrome.devtools.inspectedWindow.eval(deleteString, (stringResult, isException) => {
            if (isException) {
                console.error(isException);
            }
        });
    }

    clearStorage(storageName) {
        let clearString = `(function() {${storageName}.clear();})();`;

        chrome.devtools.inspectedWindow.eval(clearString, (stringResult, isException) => {
            if (isException) {
                console.error(isException);
            }
        });
    }
}