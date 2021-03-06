"use strict";
exports.__esModule = true;
var ScormApiWrapper = (function () {
    function ScormApiWrapper(debug) {
        this.debugModeEnabled = debug;
        this.scormVersion = '';
        this.apiHandle = null;
        this.dataCompletionStatus = null;
        this.dataExitStatus = null;
        this.handleCompletionStatus = true;
        this.handleExitMode = true;
        this.apiIsFound = false;
        this.connectionIsActive = false;
    }
    ScormApiWrapper.prototype.initialize = function () {
        var success = false;
        var completionStatus;
        var traceMsgPrefix = 'ScormApiWrapper.initialize ';
        this.trace('initialize called.');
        if (!this.connectionIsActive) {
            var API = this.getApiHandle();
            var errorCode = 0;
            if (API) {
                switch (this.scormVersion) {
                    case '1.2':
                        success = this.stringToBoolean(API.LMSInitialize(''));
                        break;
                    case '2004':
                        success = this.stringToBoolean(API.Initialize(''));
                        break;
                }
                if (success) {
                    errorCode = this.getCode();
                    if (errorCode !== null && errorCode === 0) {
                        this.connectionIsActive = true;
                        if (this.handleCompletionStatus) {
                            completionStatus = this.getStatus();
                            if (completionStatus) {
                                switch (completionStatus) {
                                    case 'not attempted':
                                    case 'unknown':
                                        this.setStatus('incomplete');
                                        break;
                                }
                                this.save();
                            }
                        }
                    }
                    else {
                        success = false;
                        this.trace(traceMsgPrefix +
                            'failed. \nError code: ' +
                            errorCode +
                            ' \nError info: ' +
                            this.getInfo(errorCode));
                    }
                }
                else {
                    errorCode = this.getCode();
                    if (errorCode !== null && errorCode !== 0) {
                        this.trace(traceMsgPrefix +
                            'failed. \nError code: ' +
                            errorCode +
                            ' \nError info: ' +
                            this.getInfo(errorCode));
                    }
                    else {
                        this.trace(traceMsgPrefix + 'failed: No response from server.');
                    }
                }
            }
            else {
                this.trace(traceMsgPrefix + 'failed: API is null.');
            }
        }
        else {
            this.trace(traceMsgPrefix + 'aborted: Connection already active.');
        }
        return success;
    };
    ScormApiWrapper.prototype.terminate = function () {
        var success = false;
        var exitStatus = this.dataExitStatus;
        var completionStatus = this.dataCompletionStatus;
        var traceMsgPrefix = 'terminate ';
        if (this.connectionIsActive) {
            var API = this.getApiHandle();
            var errorCode = 0;
            if (API) {
                if (this.handleExitMode && !exitStatus) {
                    if (completionStatus !== 'completed' && completionStatus !== 'passed') {
                        switch (this.scormVersion) {
                            case '1.2':
                                this.dataSet('cmi.core.exit', 'suspend');
                                break;
                            case '2004':
                                this.dataSet('cmi.exit', 'suspend');
                                break;
                        }
                    }
                    else {
                        switch (this.scormVersion) {
                            case '1.2':
                                this.dataSet('cmi.core.exit', 'logout');
                                break;
                            case '2004':
                                this.dataSet('cmi.exit', 'normal');
                                break;
                        }
                    }
                }
                success = this.scormVersion === '1.2' ? this.save() : true;
                if (success) {
                    switch (this.scormVersion) {
                        case '1.2':
                            success = this.stringToBoolean(API.LMSFinish(''));
                            break;
                        case '2004':
                            success = this.stringToBoolean(API.Terminate(''));
                            break;
                    }
                    if (success) {
                        this.connectionIsActive = false;
                    }
                    else {
                        errorCode = this.getCode();
                        this.trace(traceMsgPrefix +
                            'failed. \nError code: ' +
                            errorCode +
                            ' \nError info: ' +
                            this.getInfo(errorCode));
                    }
                }
            }
            else {
                this.trace(traceMsgPrefix + 'failed: API is null.');
            }
        }
        else {
            this.trace(traceMsgPrefix + 'aborted: Connection already terminated.');
        }
        return success;
    };
    ScormApiWrapper.prototype.isAvailable = function () {
        return true;
    };
    ScormApiWrapper.prototype.findApi = function (win) {
        var API = null;
        var findAttempts = 0;
        var findAttemptLimit = 500;
        var traceMsgPrefix = 'ScormApiWrapper.find';
        while (!win.API &&
            !win.API_1484_11 &&
            win.parent &&
            win.parent != win &&
            findAttempts <= findAttemptLimit) {
            findAttempts++;
            win = win.parent;
        }
        if (this.scormVersion) {
            switch (this.scormVersion) {
                case '2004':
                    if (win.API_1484_11) {
                        API = win.API_1484_11;
                    }
                    else {
                        this.trace(traceMsgPrefix +
                            ': SCORM version 2004 was specified by user, but API_1484_11 cannot be found.');
                    }
                    break;
                case '1.2':
                    if (win.API) {
                        API = win.API;
                    }
                    else {
                        this.trace(traceMsgPrefix +
                            ': SCORM version 1.2 was specified by user, but API cannot be found.');
                    }
                    break;
            }
        }
        else {
            if (win.API_1484_11) {
                this.scormVersion = '2004';
                API = win.API_1484_11;
            }
            else if (win.API) {
                this.scormVersion = '1.2';
                API = win.API;
            }
        }
        if (API) {
            this.trace(traceMsgPrefix + ': API found. Version: ' + this.scormVersion);
            this.trace('API: ' + API);
        }
        else {
            this.trace(traceMsgPrefix +
                ': Error finding API. \nFind attempts: ' +
                findAttempts +
                '. \nFind attempt limit: ' +
                findAttemptLimit);
        }
        return API;
    };
    ScormApiWrapper.prototype.getApi = function () {
        var API;
        var win = window;
        API = this.findApi(win);
        if (!API && win.parent && win.parent != win) {
            API = this.findApi(win.parent);
        }
        if (!API && win.top && win.top.opener) {
            API = this.findApi(win.top.opener);
        }
        if (!API && win.top && win.top.opener && win.top.opener.document) {
            API = this.findApi(win.top.opener.document);
        }
        if (API) {
            this.apiIsFound = true;
        }
        else {
            this.trace('API.get failed: Can\'t find the API!');
        }
        return API;
    };
    ScormApiWrapper.prototype.getApiHandle = function () {
        if (!this.apiHandle && !this.apiIsFound) {
            this.apiHandle = this.getApi();
        }
        return this.apiHandle;
    };
    ScormApiWrapper.prototype.getCode = function () {
        var API = this.getApiHandle();
        var code = 0;
        if (API) {
            switch (this.scormVersion) {
                case '1.2':
                    code = parseInt(API.LMSGetLastError(), 10);
                    break;
                case '2004':
                    code = parseInt(API.GetLastError(), 10);
                    break;
            }
        }
        else {
            this.trace('ScormApiWrapper.getCode failed: API is null.');
        }
        return code;
    };
    ScormApiWrapper.prototype.dataGet = function (parameter) {
        var value = '';
        var traceMsgPrefix = 'ScormApiWrapper.dataGet(\'' + parameter + '\') ';
        if (this.connectionIsActive) {
            var API = this.getApiHandle();
            var errorCode = 0;
            if (API) {
                switch (this.scormVersion) {
                    case '1.2':
                        value = API.LMSGetValue(parameter);
                        break;
                    case '2004':
                        value = API.GetValue(parameter);
                        break;
                }
                errorCode = this.getCode();
                if (value !== '' || errorCode === 0) {
                    switch (parameter) {
                        case 'cmi.core.lesson_status':
                        case 'cmi.completion_status':
                            this.dataCompletionStatus = value;
                            break;
                        case 'cmi.core.exit':
                        case 'cmi.exit':
                            this.dataExitStatus = value;
                            break;
                    }
                }
                else {
                    this.trace(traceMsgPrefix +
                        'failed. \nError code: ' +
                        errorCode +
                        '\nError info: ' +
                        this.getInfo(errorCode));
                }
            }
            else {
                this.trace(traceMsgPrefix + 'failed: API is null.');
            }
        }
        else {
            this.trace(traceMsgPrefix + 'failed: API connection is inactive.');
        }
        this.trace(traceMsgPrefix + ' value: ' + value);
        return String(value);
    };
    ScormApiWrapper.prototype.dataSet = function (parameter, value) {
        var success = false;
        var traceMsgPrefix = 'ScormApiWrapper.dataSet(\'' + parameter + '\') ';
        if (this.connectionIsActive) {
            var API = this.getApiHandle();
            var errorCode = 0;
            if (API) {
                switch (this.scormVersion) {
                    case '1.2':
                        success = this.stringToBoolean(API.LMSSetValue(parameter, value));
                        break;
                    case '2004':
                        success = this.stringToBoolean((API.SetValue(parameter, value)));
                        break;
                }
                if (success) {
                    if (parameter === 'cmi.core.lesson_status' ||
                        parameter === 'cmi.completion_status') {
                        this.dataCompletionStatus = value;
                    }
                }
                else {
                    errorCode = this.getCode();
                    this.trace(traceMsgPrefix +
                        'failed. \nError code: ' +
                        errorCode +
                        '. \nError info: ' +
                        this.getInfo(errorCode));
                }
            }
            else {
                this.trace(traceMsgPrefix + 'failed: API is null.');
            }
        }
        else {
            this.trace(traceMsgPrefix + 'failed: API connection is inactive.');
        }
        this.trace(traceMsgPrefix + ' value: ' + value);
        return success;
    };
    ScormApiWrapper.prototype.getStatus = function () {
        var status;
        var cmi = '';
        switch (this.scormVersion) {
            case '1.2':
                cmi = 'cmi.core.lesson_status';
                break;
            case '2004':
                cmi = 'cmi.completion_status';
                break;
        }
        status = this.dataGet(cmi);
        return status;
    };
    ScormApiWrapper.prototype.setStatus = function (status) {
        var success;
        var cmi = '';
        var traceMsgPrefix = 'ScormApiWrapper.setStatus failed';
        switch (this.scormVersion) {
            case '1.2':
                cmi = 'cmi.core.lesson_status';
                break;
            case '2004':
                cmi = 'cmi.completion_status';
                break;
        }
        if (status !== '') {
            success = this.dataSet(cmi, status);
        }
        else {
            success = false;
            this.trace(traceMsgPrefix + ': status was not specified.');
        }
        return success;
    };
    ScormApiWrapper.prototype.save = function () {
        var success = false;
        var traceMsgPrefix = 'ScormApiWrapper.save failed';
        if (this.connectionIsActive) {
            var API = this.getApiHandle();
            if (API) {
                switch (this.scormVersion) {
                    case '1.2':
                        success = this.stringToBoolean(API.LMSCommit(''));
                        break;
                    case '2004':
                        success = this.stringToBoolean(API.Commit(''));
                        break;
                }
            }
            else {
                this.trace(traceMsgPrefix + ': API is null.');
            }
        }
        else {
            this.trace(traceMsgPrefix + ': API connection is inactive.');
        }
        return success;
    };
    ScormApiWrapper.prototype.trace = function (msg) {
        if (this.debugModeEnabled) {
            if (console && console.log) {
                console.log(msg);
            }
            else {
            }
        }
    };
    ScormApiWrapper.prototype.getInfo = function (errorCode) {
        var API = this.getApiHandle();
        var result = '';
        if (API) {
            switch (this.scormVersion) {
                case '1.2':
                    result = API.LMSGetErrorString(errorCode.toString());
                    break;
                case '2004':
                    result = API.GetErrorString(errorCode.toString());
                    break;
            }
        }
        else {
            this.trace('ScormApiWrapper.getInfo failed: API is null.');
        }
        return String(result);
    };
    ScormApiWrapper.prototype.getDiagnosticInfo = function (errorCode) {
        var API = this.getApiHandle();
        var result = '';
        if (API) {
            switch (this.scormVersion) {
                case '1.2':
                    result = API.LMSGetDiagnostic(errorCode);
                    break;
                case '2004':
                    result = API.GetDiagnostic(errorCode);
                    break;
            }
        }
        else {
            this.trace('ScormApiWrapper.getDiagnosticInfo failed: API is null.');
        }
        return String(result);
    };
    ScormApiWrapper.prototype.stringToBoolean = function (value) {
        var valueType = typeof value;
        switch (valueType) {
            case 'object':
            case 'string':
                return /(true|1)/i.test(value);
            case 'number':
                return !!value;
            case 'boolean':
                return value;
            case 'undefined':
                return false;
            default:
                return false;
        }
    };
    return ScormApiWrapper;
}());
exports["default"] = ScormApiWrapper;
