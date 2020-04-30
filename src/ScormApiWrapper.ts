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
}

export default ScormApiWrapper;
