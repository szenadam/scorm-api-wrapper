class ScormApiWrapper {
  public UTILS: any;
  public debug: any;
  public SCORM: any;

  /**
   * A simple function to allow Flash ExternalInterface to confirm
   * presence of JS wrapper before attempting any LMS communication.
   * @returns {boolean} true
   */
  private isAvailable(): boolean {
    return true;
  }

  /**
   * Displays error messages when in debug mode.
   * @param {string} msg
   * @returns {void}
   */
  private trace(msg: string): void {
    if (this.debug.isActive) {
      if (window.console && window.console.log) {
        window.console.log(msg);
      } else {
        //alert(msg);
      }
    }
  }

  /**
   * Converts 'boolean strings' into actual valid booleans.
   * (Most values returned from the API are the strings "true" and "false".)
   */
  private StringToBoolean(value: any): boolean {
    var t = typeof value;
    switch (t) {
      //typeof new String("true") === "object", so handle objects as string via fall-through.
      //See https://github.com/ScormApiWrapper/scorm-api-wrapper/issues/3
      case "object":
      case "string":
        return /(true|1)/i.test(value);
      case "number":
        return !!value;
      case "boolean":
        return value;
      case "undefined":
        return null;
      default:
        return false;
    }
  }
}
