import { delay } from "./Delay";

describe("delay", () => {
  it("should delay async", async () => {
    const now = new Date();
    await delay(1000);
    expect(new Date().getTime() - now.getTime()).toBeGreaterThan(999);
  });
});
