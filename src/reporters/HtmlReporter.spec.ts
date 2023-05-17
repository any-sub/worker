import { HtmlElementPropertyReader } from "../consumers";
import { PlatformTest } from "@tsed/common";
import { Chance } from "chance";
import { HtmlReporter } from "./HtmlReporter";

const chance = new Chance();
const mockedDependencies = (properties = {}) => [
  {
    token: HtmlElementPropertyReader,
    use: {
      read: (element: Element) => properties
    }
  }
];

describe("HtmlReporter", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  describe("default reporting", () => {

    it("should build using default reporting", async () => {
      // Given
      const content = chance.string();
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter);

      // When
      const result = instance.buildReport([
        { textContent: content } as any
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });

    it("should build using default reporting excluding empty elements", async () => {
      // Given
      const content = chance.string();
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter);

      // When
      const result = instance.buildReport([
        { textContent: content } as any,
        { textContent: "" } as any
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });
  });
});