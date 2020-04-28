import "jasmine";
import Wrapper from "../src/Wrapper";

describe("Wrapper", () => {
  it("Debug mode should be set to true", () => {
    let wrapper = new Wrapper(true)
    expect(wrapper.debug).toBe(true);
  });
});
