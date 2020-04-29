class Wrapper {
  public debug: boolean;
  public scormVersion: any;
  public handleCompletionStatus: boolean;
  public handleExitMode: boolean;

  constructor(debug: boolean) {
    this.debug = debug;
    this.scormVersion = null;
    this.handleCompletionStatus = true;
    this.handleExitMode = true;
  }
}

export default Wrapper;