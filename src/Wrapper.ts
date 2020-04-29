class Wrapper {
  public debug: boolean;
  public scormVersion: any;
  public handleCompletionStatus: boolean;

  constructor(debug: boolean) {
    this.debug = debug;
    this.scormVersion = null;
    this.handleCompletionStatus = true;
  }
}

export default Wrapper;