import "jasmine";
import Wrapper from "../src/Wrapper";

describe("Wrapper", () => {
  it("debug mode should be set to true", () => {
    let wrapper = new Wrapper(true, null)
    expect(wrapper.debug).toBe(true);
  });

  it("should set scorm version to null initially", () => {
    let wrapper = new Wrapper(true, null);
    expect(wrapper.scormVersion).toBeNull();
  });
});
