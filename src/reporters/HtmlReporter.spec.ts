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

const el = (properties: Record<string, unknown>) => properties as any;

describe("HtmlReporter", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  describe("default reporting", () => {
    it("should build using default reporting", async () => {
      // Given
      const content = chance.string();
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter);

      // When
      const result = instance.buildReport([{ element: el({ textContent: content }) }]);

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
      const result = instance.buildReport([{ element: el({ textContent: content }) }, { element: el({ textContent: "" }) }]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });
  });

  describe("title", () => {
    it("should build with no formatting", async () => {
      // Given
      const content = chance.string();
      const templateMessage = chance.string();
      const deps = mockedDependencies({});
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { title: { template: templateMessage } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: templateMessage,
        description: "",
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { title: { template: templateMessage } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: fooContent,
        description: "",
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], {
        title: { template: templateMessage, match: /(?<bar>.+)/ }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: `${fooContent} ${content}`,
        description: "",
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], {
        title: { template: templateMessage, match: /(?<foo>.+)/ }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: content,
        description: "",
        image: "",
        url: ""
      });
    });
  });

  describe("description", () => {
    it("should build with no formatting", async () => {
      // Given
      const content = chance.string();
      const templateMessage = chance.string();
      const deps = mockedDependencies({});
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { description: { template: templateMessage } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: templateMessage,
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { description: { template: templateMessage } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: fooContent,
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], {
        description: { template: templateMessage, match: /(?<bar>.+)/ }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: `${fooContent} ${content}`,
        image: "",
        url: ""
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
      const result = instance.buildReport([{ element: el({ textContent: content }) }], {
        description: { template: templateMessage, match: /(?<foo>.+)/ }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: content,
        image: "",
        url: ""
      });
    });
  });

  describe("image", () => {
    it("should report with no formatting and no source", async () => {
      // Given
      const content = chance.string();
      const templateUrl = chance.url();
      const deps = mockedDependencies({});
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { image: { template: templateUrl } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: templateUrl,
        url: ""
      });
    });

    it("should report with source", async () => {
      // Given
      const url = chance.url();
      const deps = mockedDependencies({ src: url });
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ src: url }) }], {});

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: url,
        url: ""
      });
    });

    it("should report with template", async () => {
      // Given
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter);

      // When
      const result = instance.buildReport([{ element: el({ textContent: "foo: #123 bar" }) }], {
        image: {
          template: "https://someurl/{{id}}",
          match: /foo: #(?<id>\d+) bar/
        }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: "https://someurl/123",
        url: ""
      });
    });

    it("should report with non-standard attribute template", async () => {
      // Given
      const url = chance.url();
      const deps = mockedDependencies({ source: url });
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({}) }], {
        image: {
          template: "{{source}}",
          match: /.*/
        }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: url,
        url: ""
      });
    });
  });

  describe("url", () => {
    it("should report with no formatting and no source", async () => {
      // Given
      const content = chance.string();
      const templateUrl = chance.url();
      const deps = mockedDependencies({});
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ textContent: content }) }], { url: { template: templateUrl } });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: "",
        url: templateUrl
      });
    });

    it("should report with source", async () => {
      // Given
      const url = chance.url();
      const deps = mockedDependencies({ href: url });
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({ href: url }) }], {});

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: "",
        url: url
      });
    });

    it("should report with template", async () => {
      // Given
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter);

      // When
      const result = instance.buildReport([{ element: el({ textContent: "foo: #123 bar" }) }], {
        url: {
          template: "https://someurl/{{id}}",
          match: /foo: #(?<id>\d+) bar/
        }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: "",
        url: "https://someurl/123"
      });
    });

    it("should report with non-standard attribute template", async () => {
      // Given
      const url = chance.url();
      const deps = mockedDependencies({ location: url });
      const instance = await PlatformTest.invoke<HtmlReporter>(HtmlReporter, deps);

      // When
      const result = instance.buildReport([{ element: el({}) }], {
        url: {
          template: "{{location}}",
          match: /.*/
        }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "",
        description: "",
        image: "",
        url: url
      });
    });
  });
});
