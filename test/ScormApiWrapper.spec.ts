import 'jasmine';
import ScormApiWrapper from '../src/ScormApiWrapper';

describe('Wrapper', () => {
  describe('class initialization', () => {
    it('debug mode should be set to true', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.debugModeEnabled).toBe(true);
    });

    it('should set scorm version to null initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.scormVersion).toEqual('');
    });

    it('should set handleCompletionStatus to true initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.handleCompletionStatus).toBeTrue();
    });

    it('should set handleExitMode to true initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.handleExitMode).toBeTrue();
    });

    it('should set apiHandle to null initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.apiHandle).toBeNull();
    });

    it('should set apiIsFound to false initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.apiIsFound).toBeFalse();
    });

    it('should set connectionIsActive to false initially', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.connectionIsActive).toBeFalse();
    });
  });

  describe('initialize', () => {
    it('should return true and set connectionIsActive to true when successfully initialized', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      wrapper.handleCompletionStatus = true;
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Initialize: () => 'true' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      spyOn(wrapper, 'status').and.returnValue(true);
      spyOn(wrapper, 'save').and.returnValue(true);

      const result = wrapper.initialize();

      expect(result).toBeTrue();
      expect(wrapper.connectionIsActive).toBeTrue();
    });

    it('should return false and call trace when already initialized', () => {
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.initialize();

      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('terminate', () => {
    it('should return true when session is terminated successfully', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.handleExitMode = true;
      wrapper.dataExitStatus = '';
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Terminate: () => 'true' })
      spyOn(wrapper, 'dataSet').and.returnValue(true);

      const result = wrapper.terminate();

      expect(result).toBeTrue();
    });
  });

  describe('isAvailable', () => {
    it('should always return true', () => {
      const wrapper = new ScormApiWrapper(true);
      expect(wrapper.isAvailable()).toBeTrue();
    });
  });

  describe('findApi', () => {
    it('should return the API from the window parent', () => {
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      const api = wrapper.findApi(mockWindow);

      expect(api).toEqual({});
    });

    it('should return the API from multiple nested parent windows', () => {
      const wrapper = new ScormApiWrapper(false);

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

      const api = wrapper.findApi(mockWindow);

      expect(api).toEqual({});
      expect(api).toBe(mockWindow.parent.parent.parent.parent.parent.API);
    });

    it('should set the scorm version to 1.2 when the API is SCORM 1.2', () => {
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      wrapper.findApi(mockWindow);

      expect(wrapper.scormVersion).toEqual('1.2');
    });

    it('should set the scorm version to 2004 when the API is SCORM 2004', () => {
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      wrapper.findApi(mockWindow);

      expect(wrapper.scormVersion).toEqual('2004');
    });

    it('should find SCORM 2004 when the scorm version is set to 2004', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      const result = wrapper.findApi(mockWindow);

      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API_1484_11);
    });

    it('should find SCORM 1.2 when the scorm version is set to 1.2', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      const result = wrapper.findApi(mockWindow);

      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API);
    });

    it('should call trace method when scorm version is set but not found', () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'trace');

      wrapper.scormVersion = '1.2';
      wrapper.findApi({});

      wrapper.scormVersion = '2004';
      wrapper.findApi({});

      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe('getApi', () => {
    beforeEach(() => {
      (window as any).API = {};
    });

    afterEach(() => {
      delete (window as any).API;
    });

    it('should get the API object from the current window', () => {
      (window as any).API = {};
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.getApi();
      expect(result).toEqual({});
    });
  });

  describe('getApiHandle', () => {
    beforeEach(() => {
      (window as any).API = {};
    });

    afterEach(() => {
      delete (window as any).API;
    });

    it('should get the API handle when it is not set', () => {
      const wrapper = new ScormApiWrapper(false);

      const handle = wrapper.getApiHandle();

      expect(wrapper.apiHandle).toEqual({});
      expect(handle).toEqual({});
    });
  });

  describe('getCode', () => {
    it('should return the current error code from the LMS when SCORM version is 1.2', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetLastError: () => '1' });

      const result = wrapper.getCode();

      expect(result).toEqual(1);
    });

    it('should return the current error code from the LMS when SCORM version is 2004', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetLastError: () => '1' });

      const result = wrapper.getCode();

      expect(result).toEqual(1);
    });

    it('should return 0 and call the trace function when no API is found', () => {
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.getCode();

      expect(result).toEqual(0);
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('dataGet', () => {
    it('should get a value from the LMS when SCORM version is set to 1.2', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      const result = wrapper.dataGet('parameter');

      expect(result).toEqual('foo');
    });

    it('should get a value from the LMS when SCORM version is set to 2004', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      const result = wrapper.dataGet('parameter');

      expect(result).toEqual('foo');
    });

    it('should return "null" (string) and call trace function when connection is not initialized', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = false;
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.dataGet('parameter');

      expect(result).toEqual('null');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return "null" (string) and call trace function when API is null', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.dataGet('parameter');

      expect(result).toEqual('null');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return empty string and call trace function when value returned from LMS is an empty string', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => '' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.dataGet('parameter');

      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should set dataCompletionStatus property when parameter is "cmi.completion_status" (SCORM 2004)', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      wrapper.dataGet('cmi.completion_status');

      expect(wrapper.dataCompletionStatus).toEqual('foo');
    });

    it('should set dataExitStatus property when parameter is "cmi.exit" (SCORM 2004)', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      wrapper.dataGet('cmi.exit');

      expect(wrapper.dataExitStatus).toEqual('foo');
    });
  });

  describe('dataSet', () => {
    it('should return true when data set call was successful', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'true' });

      const result = wrapper.dataSet('parameter', 'value');

      expect(result).toBeTrue();
    });

    it('should return false when data set call was unsuccessful', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'false' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      spyOn(wrapper, 'getInfo').and.returnValue('');

      const result = wrapper.dataSet('parameter', 'value');

      expect(result).toBeFalse();
    });

    it('should return false and call trace function when connection is not active', () => {
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.dataSet('parameter', 'value');

      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false and call trace function when API is not found', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.dataSet('parameter', 'value');

      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should set dataCompletionStatus property when parameter is cmi.completion_status', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'false' });
      spyOn(wrapper, 'stringToBoolean').and.returnValue(true);

      wrapper.dataSet('cmi.completion_status', 'value');

      expect(wrapper.dataCompletionStatus).toEqual('value');
    });
  });

  describe('status', () => {
    it('should return true when get action is successfully done on status', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'dataGet').and.returnValue('true');

      const result = wrapper.status('get', 'status');

      expect(result).toEqual('true');
    });

    it('should return true when set action is successfully done on status', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'dataSet').and.returnValue(true);

      const result = wrapper.status('set', 'status');

      expect(result).toEqual(true);
    });

    it('should return false and call trace if action is null', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.status('', 'status');

      expect(result).toEqual(false);
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false when action is "set" and status is null', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.status('set', '');

      expect(result).toEqual(false);
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false when action is neither "set" nor "get"', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.status('foo', 'status');

      expect(result).toEqual(false);
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should return true when save was successful', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Commit: () => true });

      const result = wrapper.save();

      expect(result).toBeTrue();
    });

    it('should return false if connection is not active', () => {
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.save();

      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false if API is not found', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.save();

      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('trace', () => {
    it('should have a trace method that calls console.log when debug mode is active', () => {
      const wrapper = new ScormApiWrapper(true);
      const spy = spyOn(console, 'log');

      expect(wrapper.trace).toBeDefined();
      wrapper.trace('foo');
      expect(spy).toHaveBeenCalledWith('foo');
    });
  });

  describe('getInfo', () => {
    it('should return an empty string and call trace when API is not found', () => {
      const wrapper = new ScormApiWrapper(false);
      const getHandleSpy = spyOn(wrapper, 'getApiHandle').and.returnValue(null);
      const traceSpy = spyOn(wrapper, 'trace');

      const result = wrapper.getInfo(1);

      expect(getHandleSpy).toHaveBeenCalled();
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should get error code when scorm version is set to 1.2', () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'getApiHandle').and.returnValue({
        LMSGetErrorString: () => {
          return 'foo';
        },
      });
      wrapper.scormVersion = '1.2';

      const result = wrapper.getInfo(1);

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual('foo');
    });

    it('should get error code when scorm version is set to 2004', () => {
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'getApiHandle').and.returnValue({
        GetErrorString: () => {
          return 'foo';
        },
      });
      wrapper.scormVersion = '2004';

      const result = wrapper.getInfo(1);

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual('foo');
    });
  });

  describe('getDiagnosticInfo', () => {
    it('should return some diagnostic info from the LMS by error code when SCORM version is 2004', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetDiagnostic: () => 'foo' })

      const result = wrapper.getDiagnosticInfo(1);

      expect(result).toEqual('foo');
    });

    it('should return some diagnostic info from the LMS by error code when SCORM version is 1.2', () => {
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetDiagnostic: () => 'foo' })

      const result = wrapper.getDiagnosticInfo(1);

      expect(result).toEqual('foo');
    });

    it('should return empty string and call trace method when API is not found', () => {
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace')

      const result = wrapper.getDiagnosticInfo(1);

      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('stringToBoolean', () => {
    it('should return true when input is a String object with "true', () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(String('true'));

      expect(result).toBeTrue();
    });

    it('should return false when input is a String object with "false"', () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(String('false'));

      expect(result).toBeFalse();
    });

    it('should return boolean inputs with same value', () => {
      const wrapper = new ScormApiWrapper(false);

      let result = wrapper.stringToBoolean(true);
      expect(result).toBeTrue();

      result = wrapper.stringToBoolean(false);
      expect(result).toBeFalse();
    });

    it('should return false for the number zero', () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(0);

      expect(result).toBeFalse();
    });

    it('should return true for any non-zero integers', () => {
      const wrapper = new ScormApiWrapper(false);

      let result = wrapper.stringToBoolean(1);
      expect(result).toBeTrue();

      result = wrapper.stringToBoolean(-1);
      expect(result).toBeTrue();
    });

    it('should return null for undefined value', () => {
      const wrapper = new ScormApiWrapper(false);

      const result = wrapper.stringToBoolean(undefined);

      expect(result).toBeNull();
    });
  });
});
