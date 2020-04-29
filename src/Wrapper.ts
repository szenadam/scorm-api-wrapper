class Wrapper {
  public apiHandle: any;
  public scormVersion: any;

  public debug: boolean;
  public handleCompletionStatus: boolean;
  public handleExitMode: boolean;
  public apiIsFound: boolean;

  constructor(debug: boolean) {
    this.debug = debug;

    this.scormVersion = null;
    this.apiHandle = null;

    this.handleCompletionStatus = true;
    this.handleExitMode = true;
    this.apiIsFound = false;
  }
}

export default Wrapper;
