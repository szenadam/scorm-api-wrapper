import "jasmine";
import Wrapper from "../src/Wrapper";

describe("Wrapper", () => {
  it("debug mode should be set to true", () => {
    let wrapper = new Wrapper(true)
    expect(wrapper.debug).toBe(true);
  });

  it("should set scorm version to null initially", () => {
    let wrapper = new Wrapper(true);
    expect(wrapper.scormVersion).toBeNull();
  });
  
  it("should set handleCompletionStatus to true initially", () => {
    let wrapper = new Wrapper(true);
    expect(wrapper.handleCompletionStatus).toBeTrue();
  });
  
  it("should set handleExitMode to true initially", () => {
    let wrapper = new Wrapper(true);
    expect(wrapper.handleExitMode).toBeTrue();
  });
});
