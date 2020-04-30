import "jasmine";
import ScormApiWrapper from "../src/ScormApiWrapper";

describe("Wrapper", () => {
  describe("initialization", () => {
    it("debug mode should be set to true", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.debug).toBe(true);
    });

    it("should set scorm version to null initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.scormVersion).toBeNull();
    });

    it("should set handleCompletionStatus to true initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.handleCompletionStatus).toBeTrue();
    });

    it("should set handleExitMode to true initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.handleExitMode).toBeTrue();
    });

    it("should set apiHandle to null initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.apiHandle).toBeNull();
    });

    it("should set apiIsFound to false initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.apiIsFound).toBeFalse();
    });

    it("should set connectionIsActive to false initially", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.connectionIsActive).toBeFalse();
    });
  });

  describe("isAvailable", () => {
    it("should always return true", () => {
      let wrapper = new ScormApiWrapper(true);
      expect(wrapper.isAvailable()).toBeTrue();
    });
  });

  describe("trace", () => {
    it("should have a trace method that calls console.log when debug mode is active", () => {
      let wrapper = new ScormApiWrapper(true);

      const spy = spyOn(console, 'log');

      expect(wrapper.trace).toBeDefined();
      wrapper.trace('foo');
      expect(spy).toHaveBeenCalledWith('foo');
    })
  });
});
