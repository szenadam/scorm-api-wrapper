class ScormApiWrapper {
  public apiHandle: any;
  public scormVersion: any;

  public debug: boolean;
  public handleCompletionStatus: boolean;
  public handleExitMode: boolean;
  public apiIsFound: boolean;
  public connectionIsActive: boolean;

  constructor(debug: boolean) {
    this.debug = debug;

    this.scormVersion = null;
    this.apiHandle = null;

    this.handleCompletionStatus = true;
    this.handleExitMode = true;
    this.apiIsFound = false;
    this.connectionIsActive = false;
  }

  /**
   * A simple function to allow Flash ExternalInterface to confirm
   * presence of JS wrapper before attempting any LMS communication.
   */
  public isAvailable(): boolean {
    return true;
  }

  /**
   * Displays error messages when in debug mode.
   * @param msg message to be displayed
   */
  public trace(msg: string): void {
    if (this.debug) {
      if (console && console.log) {
        console.log(msg);
      } else {
        //alert(msg);
      }
    }
  }

  /**
   * Looks for an object named API in parent and opener windows
   * @param win the window object
   */
  public find(win: any): any {
    let API = null;
    let findAttempts = 0;
    const findAttemptLimit = 500;
    const traceMsgPrefix = "SCORM.API.find";

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
        case "2004":
          if (win.API_1484_11) {
            API = win.API_1484_11;
          } else {
            this.trace(
              traceMsgPrefix +
                ": SCORM version 2004 was specified by user, but API_1484_11 cannot be found."
            );
          }
          break;
        case "1.2":
          if (win.API) {
            API = win.API;
          } else {
            this.trace(
              traceMsgPrefix +
                ": SCORM version 1.2 was specified by user, but API cannot be found."
            );
          }
          break;
      }
    } else {
      //If SCORM version not specified by user, look for APIs
      if (win.API_1484_11) {
        //SCORM 2004-specific API.
        this.scormVersion = "2004";
        API = win.API_1484_11;
      } else if (win.API) {
        //SCORM 1.2-specific API
        this.scormVersion = "1.2";
        API = win.API;
      }
    }

    if (API) {
      this.trace(traceMsgPrefix + ": API found. Version: " + this.scormVersion);
      this.trace("API: " + API);
    } else {
      this.trace(
        traceMsgPrefix +
          ": Error finding API. \nFind attempts: " +
          findAttempts +
          ". \nFind attempt limit: " +
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
  public get(): any {
    let API = null;
    let win = window;

    API = this.find(win);

    if (!API && win.parent && win.parent != win) {
      API = this.find(win.parent);
    }

    if (!API && win.top && win.top.opener) {
      API = this.find(win.top.opener);
    }

    if (!API && win.top && win.top.opener && win.top.opener.document) {
      API = this.find(win.top.opener.document);
    }

    if (API) {
      this.apiIsFound = true;
    } else {
      this.trace("API.get failed: Can't find the API!");
    }

    return API;
  }
}

export default ScormApiWrapper;
