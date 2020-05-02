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
      const spy = spyOn(console, "log");

      expect(wrapper.trace).toBeDefined();
      wrapper.trace("foo");
      expect(spy).toHaveBeenCalledWith("foo");
    });
  });

  describe("find", () => {
    it("should return the API from the window parent", () => {
      let wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      const api = wrapper.find(mockWindow);

      expect(api).toEqual({});
    });

    it("should return the API from multiple nested parent windows", () => {
      let wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          parent: {
            parent: {
              parent: {
                parent: {
                  API: {},
                },
              },
            },
          },
        },
      };

      const api = wrapper.find(mockWindow);

      expect(api).toEqual({});
      expect(api).toBe(mockWindow.parent.parent.parent.parent.parent.API);
    });

    it("should set the scorm version to 1.2 when the API is SCORM 1.2", () => {
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      wrapper.find(mockWindow);

      expect(wrapper.scormVersion).toEqual("1.2");
    });

    it("should set the scorm version to 2004 when the API is SCORM 2004", () => {
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      wrapper.find(mockWindow);

      expect(wrapper.scormVersion).toEqual("2004");
    });

    it("should find SCORM 2004 when the scorm version is set to 2004", () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = "2004";

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      const result = wrapper.find(mockWindow);

      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API_1484_11);
    });

    it("should find SCORM 1.2 when the scorm version is set to 1.2", () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = "1.2";

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      const result = wrapper.find(mockWindow);

      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API);
    });

    it("should call trace method when scorm version is set but not found", () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, "trace");

      wrapper.scormVersion = "1.2";
      wrapper.find({});

      wrapper.scormVersion = "2004";
      wrapper.find({});

      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe("get", () => {
    beforeEach(() => {
      window["API"] = {};
    });

    afterEach(() => {
      delete window["API"];
    });

    it("should get the API object from the current window", () => {
      window["API"] = {};
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.get();
      expect(result).toEqual({});
    });
  });

  describe("getHandle", () => {
    beforeEach(() => {
      window["API"] = {};
    });

    afterEach(() => {
      delete window["API"];
    });

    it("should get the API handle when it is not set", () => {
      const wrapper = new ScormApiWrapper(false);

      const handle = wrapper.getHandle();

      expect(wrapper.apiHandle).toEqual({});
      expect(handle).toEqual({});
    });
  });

  describe("getInfo", () => {
    it("should return an empty string and call trace when API is not found", () => {
      const wrapper = new ScormApiWrapper(false);
      const getHandleSpy = spyOn(wrapper, "getHandle").and.returnValue(null);
      const traceSpy = spyOn(wrapper, "trace");

      const result = wrapper.getInfo(1);

      expect(getHandleSpy).toHaveBeenCalled();
      expect(result).toEqual("");
      expect(traceSpy).toHaveBeenCalled();
    });

    it("should get error code when scorm version is set to 1.2", () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, "getHandle").and.returnValue({
        LMSGetErrorString: () => {
          return "foo";
        },
      });
      wrapper.scormVersion = "1.2";

      const result = wrapper.getInfo(1);

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual("foo");
    });

    it("should get error code when scorm version is set to 2004", () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, "getHandle").and.returnValue({
        GetErrorString: () => {
          return "foo";
        },
      });
      wrapper.scormVersion = "2004";

      const result = wrapper.getInfo(1);

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual("foo");
    });
  });

  describe("stringToBoolean", () => {
    it("should return true when input is a String object with 'true'", () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(String("true"));

      expect(result).toBeTrue();
    });

    it("should return false when input is a String object with 'false'", () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(String("false"));

      expect(result).toBeFalse();
    });

    it("should return boolean inputs with same value", () => {
      const wrapper = new ScormApiWrapper(false);

      let result = wrapper.stringToBoolean(true);
      expect(result).toBeTrue();

      result = wrapper.stringToBoolean(false);
      expect(result).toBeFalse();
    });

    it("should return false for the number zero", () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(0);

      expect(result).toBeFalse();
    });

    it("should return true for any non-zero integers", () => {
      const wrapper = new ScormApiWrapper(false);

      let result = wrapper.stringToBoolean(1);
      expect(result).toBeTrue();

      result = wrapper.stringToBoolean(-1);
      expect(result).toBeTrue();
    });

    it("should return null for undefined value", () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(undefined);

      expect(result).toBeNull();
    });
  });
});
