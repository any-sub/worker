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

  it("should build with no formatting", async () => {
    // Given
    const content = chance.string();
    const templateMessage = chance.string();
    const deps = mockedDependencies({});
    const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

    // When
    const result = instance.buildReport([
      { textContent: content } as any
    ], { title: { template: templateMessage } });

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: templateMessage,
      description: ""
    });
  });

  it("should build with properties", async () => {
    // Given
    const content = chance.string();
    const templateMessage = "{{foo}}";
    const fooContent = chance.string();
    const deps = mockedDependencies({ foo: fooContent });
    const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

    // When
    const result = instance.buildReport([
      { textContent: content } as any
    ], { title: { template: templateMessage } });

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: fooContent,
      description: ""
    });
  });

  it("should build with properties and regex groups", async () => {
    // Given
    const content = chance.string();
    const templateMessage = "{{foo}} {{bar}}";
    const fooContent = chance.string();
    const deps = mockedDependencies({ foo: fooContent });
    const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

    // When
    const result = instance.buildReport([
      { textContent: content } as any
    ], { title: { template: templateMessage, match: /(?<bar>.+)/ } });

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: `${fooContent} ${content}`,
      description: ""
    });
  });

  it("should build with properties and regex groups where regex has priority", async () => {
    // Given
    const content = chance.string();
    const templateMessage = "{{foo}}";
    const fooContent = chance.string();
    const deps = mockedDependencies({ foo: fooContent });
    const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

    // When
    const result = instance.buildReport([
      { textContent: content } as any
    ], { title: { template: templateMessage, match: /(?<foo>.+)/ } });

    // Then
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: content,
      description: ""
    });
  });
});