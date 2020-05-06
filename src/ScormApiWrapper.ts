class ScormApiWrapper {
  public apiHandle: any;
  public scormVersion: string;

  public debugModeEnabled: boolean;
  public handleCompletionStatus: boolean;
  public handleExitMode: boolean;
  public apiIsFound: boolean;
  public connectionIsActive: boolean;

  public dataCompletionStatus: any;
  public dataExitStatus: any;

  constructor(debug: boolean) {
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

  /**
   * Tells the LMS to initiate the communication session.
   */
  public initialize(): boolean {
    let success: boolean | null = false;
    let completionStatus = this.dataCompletionStatus;
    const traceMsgPrefix = 'ScormApiWrapper.initialize ';

    this.trace('initialize called.');

    if (!this.connectionIsActive) {
      const API = this.getApiHandle();
      let errorCode = 0;

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
              completionStatus = this.status('get', '');

              if (completionStatus) {
                switch (completionStatus) {
                  case 'not attempted':
                  case 'unknown':
                    this.status('set', 'incomplete');
                    break;
                  // Additional options, presented here in case you'd like to use them
                  // case "completed"  : break;
                  // case "incomplete" : break;
                  // case "passed"     : break;    //SCORM 1.2 only
                  // case "failed"     : break;    //SCORM 1.2 only
                  // case "browsed"    : break;    //SCORM 1.2 only
                }
                this.save();
              }

            }

          } else {
            success = false;
            this.trace(
              traceMsgPrefix +
              'failed. \nError code: ' +
              errorCode +
              ' \nError info: ' +
              this.getInfo(errorCode)
            );
          }
        } else {
          errorCode = this.getCode();

          if (errorCode !== null && errorCode !== 0) {
            this.trace(
              traceMsgPrefix +
              'failed. \nError code: ' +
              errorCode +
              ' \nError info: ' +
              this.getInfo(errorCode)
            );
          } else {
            this.trace(traceMsgPrefix + 'failed: No response from server.');
          }
        }
      } else {
        this.trace(traceMsgPrefix + 'failed: API is null.');
      }
    } else {
      this.trace(traceMsgPrefix + 'aborted: Connection already active.');
    }

    return success;
  }

  /**
   * Tells the LMS to terminate the communication session
   */
  public terminate(): boolean {
    let success = false;
    const exitStatus = this.dataExitStatus;
    const completionStatus = this.dataCompletionStatus;
    const traceMsgPrefix = 'terminate ';

    if (this.connectionIsActive) {
      const API = this.getApiHandle();
      let errorCode = 0;

      if (API) {

        if (this.handleExitMode && !exitStatus) {
          if (completionStatus !== 'completed' && completionStatus !== 'passed') {
            switch (this.scormVersion) {
              case '1.2':
                success = this.dataSet('cmi.core.exit', 'suspend');
                break;
              case '2004':
                success = this.dataSet('cmi.exit', 'suspend');
                break;
            }
          } else {
            switch (this.scormVersion) {
              case '1.2':
                success = this.dataSet('cmi.core.exit', 'logout');
                break;
              case '2004':
                success = this.dataSet('cmi.exit', 'normal');
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
          } else {
            errorCode = this.getCode();
            this.trace(
              traceMsgPrefix +
              'failed. \nError code: ' +
              errorCode +
              ' \nError info: ' +
              this.getInfo(errorCode)
            );
          }
        }
      } else {
        this.trace(traceMsgPrefix + 'failed: API is null.');
      }
    } else {
      this.trace(traceMsgPrefix + 'aborted: Connection already terminated.');
    }

    return success;
  }

  /**
   * A simple function to allow Flash ExternalInterface to confirm
   * presence of JS wrapper before attempting any LMS communication.
   */
  public isAvailable(): boolean {
    return true;
  }

  /**
   * Looks for an object named API in parent and opener windows
   * @param win the window object
   */
  public findApi(win: any): any {
    let API = null;
    let findAttempts = 0;
    const findAttemptLimit = 500;
    const traceMsgPrefix = 'ScormApiWrapper.find';

    while (
      !win.API &&
      !win.API_1484_11 &&
      win.parent &&
      win.parent != win &&
      findAttempts <= findAttemptLimit
      ) {
      findAttempts++;
      win = win.parent;
    }

    if (this.scormVersion) {
      switch (this.scormVersion) {
        case '2004':
          if (win.API_1484_11) {
            API = win.API_1484_11;
          } else {
            this.trace(
              traceMsgPrefix +
              ': SCORM version 2004 was specified by user, but API_1484_11 cannot be found.'
            );
          }
          break;
        case '1.2':
          if (win.API) {
            API = win.API;
          } else {
            this.trace(
              traceMsgPrefix +
              ': SCORM version 1.2 was specified by user, but API cannot be found.'
            );
          }
          break;
      }
    } else {
      if (win.API_1484_11) {
        this.scormVersion = '2004';
        API = win.API_1484_11;
      } else if (win.API) {
        this.scormVersion = '1.2';
        API = win.API;
      }
    }

    if (API) {
      this.trace(traceMsgPrefix + ': API found. Version: ' + this.scormVersion);
      this.trace('API: ' + API);
    } else {
      this.trace(
        traceMsgPrefix +
        ': Error finding API. \nFind attempts: ' +
        findAttempts +
        '. \nFind attempt limit: ' +
        findAttemptLimit
      );
    }

    return API;
  }

  /**
   * Looks for an object named API, first in the current window's frame
   * hierarchy and then, if necessary, in the current window's opener window
   * hierarchy (if there is an opener window).
   */
  public getApi(): any {
    let API: null;
    const win = window;

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
    } else {
      this.trace('API.get failed: Can\'t find the API!');
    }

    return API;
  }

  /**
   * Returns the handle to API object if it was previously set
   */
  public getApiHandle(): any {
    if (!this.apiHandle && !this.apiIsFound) {
      this.apiHandle = this.getApi();
    }

    return this.apiHandle;
  }

  /**
   * Requests the error code for the current error state from the LMS
   */
  public getCode(): number {
    const API = this.getApiHandle();
    let code = 0;

    if (API) {
      switch (this.scormVersion) {
        case '1.2':
          code = parseInt(API.LMSGetLastError(), 10);
          break;
        case '2004':
          code = parseInt(API.GetLastError(), 10);
          break;
      }
    } else {
      this.trace('ScormApiWrapper.getCode failed: API is null.');
    }

    return code;
  }

  /**
   * Requests information from the LMS.
   *
   * Side effects:
   *  - Sets the class property dataCompletionStatus when "cmi.core.lesson_status" (SCORM 1.2) or "cmi.completion_status"
   * (SCORM 2004) is requested.
   *  - Also sets class property dataExitStatus when "cmi.core.exit" (SCORM 1.2) or "cmi.exit"
   * (SCORM 2004) is requested.
   * @param {string} parameter parameter name of the SCORM data model element
   */
  public dataGet(parameter: string): string {
    let value = null;
    const traceMsgPrefix = 'ScormApiWrapper.dataGet(\'' + parameter + '\') ';

    if (this.connectionIsActive) {
      const API = this.getApiHandle();
      let errorCode = 0;

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
        } else {
          this.trace(
            traceMsgPrefix +
            'failed. \nError code: ' +
            errorCode +
            '\nError info: ' +
            this.getInfo(errorCode)
          );
        }
      } else {
        this.trace(traceMsgPrefix + 'failed: API is null.');
      }
    } else {
      this.trace(traceMsgPrefix + 'failed: API connection is inactive.');
    }

    this.trace(traceMsgPrefix + ' value: ' + value);

    return String(value);
  }

  /**
   * Tells the LMS to assign the value to the named data model element.
   * Also stores the SCO's completion status in a variable named
   * ScormApiWrapper.completionStatus. This variable is checked whenever
   * ScormApiWrapper.terminate() is invoked.
   * @param parameter {string} The data model element
   * @param value {string} The value for the data model element
   */
  public dataSet(parameter: string, value: string): boolean {
    let success: boolean = false;
    const traceMsgPrefix = 'ScormApiWrapper.dataSet(\'' + parameter + '\') ';

    if (this.connectionIsActive) {
      const API = this.getApiHandle();
      let errorCode = 0;

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
          if (
            parameter === 'cmi.core.lesson_status' ||
            parameter === 'cmi.completion_status'
          ) {
            this.dataCompletionStatus = value;
          }
        } else {
          errorCode = this.getCode();

          this.trace(
            traceMsgPrefix +
            'failed. \nError code: ' +
            errorCode +
            '. \nError info: ' +
            this.getInfo(errorCode)
          );
        }
      } else {
        this.trace(traceMsgPrefix + 'failed: API is null.');
      }
    } else {
      this.trace(traceMsgPrefix + 'failed: API connection is inactive.');
    }

    this.trace(traceMsgPrefix + ' value: ' + value);

    return success;
  }

  public status(action: string, status: string): string | boolean | null {
    let success: string | boolean | null = false;
    const traceMsgPrefix = 'ScormApiWrapper.status failed';
    let cmi = '';

    if (action !== null) {
      switch (this.scormVersion) {
        case '1.2':
          cmi = 'cmi.core.lesson_status';
          break;
        case '2004':
          cmi = 'cmi.completion_status';
          break;
      }

      switch (action) {
        case 'get':
          success = this.dataGet(cmi);
          break;
        case 'set':
          if (status !== '') {
            success = this.dataSet(cmi, status);
          } else {
            success = false;
            this.trace(traceMsgPrefix + ': status was not specified.');
          }
          break;
        default:
          success = false;
          this.trace(traceMsgPrefix + ': no valid action was specified.');
      }
    } else {
      this.trace(traceMsgPrefix + ': action was not specified.');
    }

    return success;
  }

  /**
   * Instructs the LMS to persist all data to this point in the session
   */
  public save(): boolean | null {
    let success: boolean | null = false;
    const traceMsgPrefix = 'ScormApiWrapper.save failed';

    if (this.connectionIsActive) {
      const API = this.getApiHandle();
      if (API) {
        switch (this.scormVersion) {
          case '1.2':
            success = this.stringToBoolean(API.LMSCommit(''));
            break;
          case '2004':
            success = this.stringToBoolean(API.Commit(''));
            break;
        }
      } else {
        this.trace(traceMsgPrefix + ': API is null.');
      }
    } else {
      this.trace(traceMsgPrefix + ': API connection is inactive.');
    }

    return success;
  }

  /**
   * Displays error messages when in debug mode.
   * @param msg message to be displayed
   */
  public trace(msg: string): void {
    if (this.debugModeEnabled) {
      if (console && console.log) {
        console.log(msg);
      } else {
        // ignored
      }
    }
  }

  /**
   * "Used by a SCO to request the textual description for the error code
   * specified by the value of [errorCode]."
   * @param errorCode {number}
   */
  public getInfo(errorCode: number): string {
    const API = this.getApiHandle();
    let result = '';

    if (API) {
      switch (this.scormVersion) {
        case '1.2':
          result = API.LMSGetErrorString(errorCode.toString());
          break;
        case '2004':
          result = API.GetErrorString(errorCode.toString());
          break;
      }
    } else {
      this.trace('ScormApiWrapper.getInfo failed: API is null.');
    }

    return String(result);
  }

  /**
   * "Exists for LMS specific use. It allows the LMS to define additional
   * diagnostic information through the API Instance."
   * @param {number} errorCode
   */
  public getDiagnosticInfo(errorCode: number): string {
    const API = this.getApiHandle();
    let result = '';

    if (API) {
      switch (this.scormVersion) {
        case '1.2':
          result = API.LMSGetDiagnostic(errorCode);
          break;
        case '2004':
          result = API.GetDiagnostic(errorCode);
          break;
      }
    } else {
      this.trace('ScormApiWrapper.getDiagnosticInfo failed: API is null.');
    }

    return String(result);
  }

  /**
   * Converts 'boolean strings' into actual valid booleans.
   * (Most values returned from the API are the strings "true" and "false".)
   * @param value
   */
  public stringToBoolean(value: any): boolean {
    const valueType = typeof value;
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
  }
}

export default ScormApiWrapper;
