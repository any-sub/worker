import { Chance } from "chance";
import { HtmlReporter } from "./HtmlReporter";
import { HtmlElementPropertyReader } from "../consumers";

const chance = new Chance();

const el = (properties: Record<string, unknown> = {}, tagName: string = "") =>
  ({
    ...properties,
    getAttributeNames: () => Object.keys(properties),
    getAttribute: (name: string) => properties[name],
    getTagName: () => tagName
  } as any);

describe("HtmlReporter", () => {
  let htmlElementPropertyReader = new HtmlElementPropertyReader();

  describe("default reporting", () => {
    it("should build from description element using default reporting", async () => {
      // Given
      const content = chance.string();
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport([
        {
          description: el({ textContent: content }),
          element: el()
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });

    it("should build using default reporting", async () => {
      // Given
      const content = chance.string();
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport(
        [
          {
            element: el({
              textContent: content,
              foo: fooContent
            })
          }
        ],
        { title: { template: templateMessage } }
      );

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport(
        [
          {
            element: el({
              textContent: content,
              foo: fooContent
            })
          }
        ],
        {
          title: { template: templateMessage, match: /(?<bar>.+)/ }
        }
      );

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport(
        [
          {
            element: el({
              textContent: content,
              foo: fooContent
            })
          }
        ],
        { description: { template: templateMessage } }
      );

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport(
        [
          {
            element: el({
              textContent: content,
              foo: fooContent
            })
          }
        ],
        {
          description: { template: templateMessage, match: /(?<bar>.+)/ }
        }
      );

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport([{ element: el({ source: url }) }], {
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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

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
      const instance = new HtmlReporter(htmlElementPropertyReader);

      // When
      const result = instance.buildReport([{ element: el({ location: url }) }], {
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
