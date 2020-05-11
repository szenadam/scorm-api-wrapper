import 'jasmine';
import ScormApiWrapper from '../src/ScormApiWrapper';

describe('Wrapper', () => {
  describe('class initialization', () => {
    it('debug mode should be set to true', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.debugModeEnabled).toBe(true);
    });

    it('should set scorm version to null initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.scormVersion).toEqual('');
    });

    it('should set handleCompletionStatus to true initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.handleCompletionStatus).toBeTrue();
    });

    it('should set handleExitMode to true initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.handleExitMode).toBeTrue();
    });

    it('should set apiHandle to null initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.apiHandle).toBeNull();
    });

    it('should set apiIsFound to false initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.apiIsFound).toBeFalse();
    });

    it('should set connectionIsActive to false initially', () => {
      // Arrange, Act
      const wrapper = new ScormApiWrapper(true);

      // Assert
      expect(wrapper.connectionIsActive).toBeFalse();
    });
  });

  describe('initialize', () => {
    it('should return true and set connectionIsActive to true when successfully initialized', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      wrapper.handleCompletionStatus = true;
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Initialize: () => 'true' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      spyOn(wrapper, 'getStatus').and.returnValue('completed');
      spyOn(wrapper, 'save').and.returnValue(true);

      // Act
      const result = wrapper.initialize();

      // Assert
      expect(result).toBeTrue();
      expect(wrapper.connectionIsActive).toBeTrue();
    });

    it('should return false and call trace when already initialized', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.initialize();

      // Assert
      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('terminate', () => {
    it('should return true when session is terminated successfully', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.handleExitMode = true;
      wrapper.dataExitStatus = '';
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Terminate: () => 'true' })
      spyOn(wrapper, 'dataSet').and.returnValue(true);

      // Act
      const result = wrapper.terminate();

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe('isAvailable', () => {
    it('should always return true', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(true);

      // Act
      const result = wrapper.isAvailable();

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe('findApi', () => {
    it('should return the API from the window parent', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      // Act
      const api = wrapper.findApi(mockWindow);

      // Assert
      expect(api).toEqual({});
    });

    it('should return the API from multiple nested parent windows', () => {
      // Arrange
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

      // Act
      const api = wrapper.findApi(mockWindow);

      // Assert
      expect(api).toEqual({});
      expect(api).toBe(mockWindow.parent.parent.parent.parent.parent.API);
    });

    it('should set the scorm version to 1.2 when the API is SCORM 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      // Act
      wrapper.findApi(mockWindow);

      // Assert
      expect(wrapper.scormVersion).toEqual('1.2');
    });

    it('should set the scorm version to 2004 when the API is SCORM 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      // Act
      wrapper.findApi(mockWindow);

      // Assert
      expect(wrapper.scormVersion).toEqual('2004');
    });

    it('should find SCORM 2004 when the scorm version is set to 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';

      const mockWindow = {
        parent: {
          API_1484_11: {},
        },
      };

      // Act
      const result = wrapper.findApi(mockWindow);

      // Assert
      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API_1484_11);
    });

    it('should find SCORM 1.2 when the scorm version is set to 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';

      const mockWindow = {
        parent: {
          API: {},
        },
      };

      // Act
      const result = wrapper.findApi(mockWindow);

      // Assert
      expect(result).toEqual({});
      expect(result).toBe(mockWindow.parent.API);
    });

    it('should call trace method when scorm version is set but not found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'trace');

      // Act
      wrapper.scormVersion = '1.2';
      wrapper.findApi({});

      wrapper.scormVersion = '2004';
      wrapper.findApi({});

      // Assert
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
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const result = wrapper.getApi();

      // Assert
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
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const handle = wrapper.getApiHandle();

      // Assert
      expect(wrapper.apiHandle).toEqual({});
      expect(handle).toEqual({});
    });
  });

  describe('getCode', () => {
    it('should return the current error code from the LMS when SCORM version is 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetLastError: () => '1' });

      // Act
      const result = wrapper.getCode();

      // Assert
      expect(result).toEqual(1);
    });

    it('should return the current error code from the LMS when SCORM version is 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetLastError: () => '1' });

      // Act
      const result = wrapper.getCode();

      // Assert
      expect(result).toEqual(1);
    });

    it('should return 0 and call the trace function when no API is found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.getCode();

      // Assert
      expect(result).toEqual(0);
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('dataGet', () => {
    it('should get a value from the LMS when SCORM version is set to 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      const result = wrapper.dataGet('parameter');

      // Assert
      expect(result).toEqual('foo');
    });

    it('should get a value from the LMS when SCORM version is set to 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      const result = wrapper.dataGet('parameter');

      // Assert
      expect(result).toEqual('foo');
    });

    it('should return empty string and call trace function when connection is not initialized', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = false;
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.dataGet('parameter');

      // Assert
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return empty string and call trace function when API is null', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.dataGet('parameter');

      // Assert
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return empty string and call trace function when value returned from LMS is an empty string', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => '' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.dataGet('parameter');

      // Assert
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should set dataCompletionStatus property when parameter is "cmi.completion_status" (SCORM 2004)', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      wrapper.dataGet('cmi.completion_status');

      // Assert
      expect(wrapper.dataCompletionStatus).toEqual('foo');
    });

    it('should set dataExitStatus property when parameter is "cmi.exit" (SCORM 2004)', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'foo' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      wrapper.dataGet('cmi.exit');

      // Assert
      expect(wrapper.dataExitStatus).toEqual('foo');
    });
  });

  describe('dataSet', () => {
    it('should return true when data set call was successful', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'true' });

      // Act
      const result = wrapper.dataSet('parameter', 'value');

      // Assert
      expect(result).toBeTrue();
    });

    it('should return false when data set call was unsuccessful', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'false' });
      spyOn(wrapper, 'getCode').and.returnValue(0);
      spyOn(wrapper, 'getInfo').and.returnValue('');

      // Act
      const result = wrapper.dataSet('parameter', 'value');

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false and call trace function when connection is not active', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.dataSet('parameter', 'value');

      // Assert
      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false and call trace function when API is not found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.dataSet('parameter', 'value');

      // Assert
      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should set dataCompletionStatus property when parameter is cmi.completion_status', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ SetValue: () => 'false' });
      spyOn(wrapper, 'stringToBoolean').and.returnValue(true);

      // Act
      wrapper.dataSet('cmi.completion_status', 'value');

      // Assert
      expect(wrapper.dataCompletionStatus).toEqual('value');
    });
  });

  describe('getStatus', () => {
    it('should get the status of the SCO when SCORM version is 1.2 and there was no error code', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetValue: () => 'completed' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      const result = wrapper.getStatus();

      // Assert
      expect(result).toEqual('completed');
      expect(wrapper.dataCompletionStatus).toEqual('completed');
    });

    it('should get the status of the SCO when SCORM version is 1.2 and there was no error code', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetValue: () => 'completed' });
      spyOn(wrapper, 'getCode').and.returnValue(0);

      // Act
      const result = wrapper.getStatus();

      // Assert
      expect(result).toEqual('completed');
      expect(wrapper.dataCompletionStatus).toEqual('completed');
    });
  });

  describe('setStatus', () => {
    it('should set the completion status of the SCO when SCORM version is 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';
      const dataSetSpy = spyOn(wrapper, 'dataSet').and.returnValue(true);

      // Act
      const result = wrapper.setStatus('completed');

      // Assert
      expect(result).toEqual(true);
      expect(dataSetSpy).toHaveBeenCalledWith('cmi.core.lesson_status', 'completed');
    });

    it('should set the completion status of the SCO when SCORM version is 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      const dataSetSpy = spyOn(wrapper, 'dataSet').and.returnValue(true);

      // Act
      const result = wrapper.setStatus('completed');

      // Assert
      expect(result).toEqual(true);
      expect(dataSetSpy).toHaveBeenCalledWith('cmi.completion_status', 'completed');
    });
  });

  describe('save', () => {
    it('should return true when save was successful', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ Commit: () => true });

      // Act
      const result = wrapper.save();

      // Assert
      expect(result).toBeTrue();
    });

    it('should return false if connection is not active', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.save();

      // Assert
      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should return false if API is not found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.connectionIsActive = true;
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.save();

      // Assert
      expect(result).toBeFalse();
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('trace', () => {
    it('should have a trace method that calls console.log when debug mode is active', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(true);
      const spy = spyOn(console, 'log');

      // Act
      wrapper.trace('foo');

      // Assert
      expect(spy).toHaveBeenCalledWith('foo');
    });
  });

  describe('getInfo', () => {
    it('should return an empty string and call trace when API is not found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const getHandleSpy = spyOn(wrapper, 'getApiHandle').and.returnValue(null);
      const traceSpy = spyOn(wrapper, 'trace');

      // Act
      const result = wrapper.getInfo(1);

      // Assert
      expect(getHandleSpy).toHaveBeenCalled();
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });

    it('should get error code when scorm version is set to 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'getApiHandle').and.returnValue({
        LMSGetErrorString: () => {
          return 'foo';
        },
      });
      wrapper.scormVersion = '1.2';

      // Act
      const result = wrapper.getInfo(1);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual('foo');
    });

    it('should get error code when scorm version is set to 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const spy = spyOn(wrapper, 'getApiHandle').and.returnValue({
        GetErrorString: () => {
          return 'foo';
        },
      });
      wrapper.scormVersion = '2004';

      // Act
      const result = wrapper.getInfo(1);

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual('foo');
    });
  });

  describe('getDiagnosticInfo', () => {
    it('should return some diagnostic info from the LMS by error code when SCORM version is 2004', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '2004';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ GetDiagnostic: () => 'foo' })

      // Act
      const result = wrapper.getDiagnosticInfo(1);

      // Assert
      expect(result).toEqual('foo');
    });

    it('should return some diagnostic info from the LMS by error code when SCORM version is 1.2', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      wrapper.scormVersion = '1.2';
      spyOn(wrapper, 'getApiHandle').and.returnValue({ LMSGetDiagnostic: () => 'foo' })

      // Act
      const result = wrapper.getDiagnosticInfo(1);

      // Assert
      expect(result).toEqual('foo');
    });

    it('should return empty string and call trace method when API is not found', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);
      const traceSpy = spyOn(wrapper, 'trace')

      // Act
      const result = wrapper.getDiagnosticInfo(1);

      // Assert
      expect(result).toEqual('');
      expect(traceSpy).toHaveBeenCalled();
    });
  });

  describe('stringToBoolean', () => {
    it('should return true when input is a String object with "true', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const result = wrapper.stringToBoolean(String('true'));

      // Assert
      expect(result).toBeTrue();
    });

    it('should return false when input is a String object with "false"', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const result = wrapper.stringToBoolean(String('false'));

      // Assert
      expect(result).toBeFalse();
    });

    it('should return boolean inputs with same value', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act, Assert
      let result = wrapper.stringToBoolean(true);
      expect(result).toBeTrue();
      result = wrapper.stringToBoolean(false);
      expect(result).toBeFalse();
    });

    it('should return false for the number zero', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const result = wrapper.stringToBoolean(0);

      // Assert
      expect(result).toBeFalse();
    });

    it('should return true for any non-zero integers', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act, Assert
      let result = wrapper.stringToBoolean(1);
      expect(result).toBeTrue();
      result = wrapper.stringToBoolean(-1);
      expect(result).toBeTrue();
    });

    it('should return null for undefined value', () => {
      // Arrange
      const wrapper = new ScormApiWrapper(false);

      // Act
      const result = wrapper.stringToBoolean(undefined);

      // Assert
      expect(result).toBeFalse();
    });
  });
});
