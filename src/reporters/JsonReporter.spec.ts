import { Chance } from "chance";
import { JsonReporter } from "./JsonReporter";

const chance = new Chance();

describe("JsonReporter", () => {
  describe("default reporting", () => {
    it("should build from description element using default reporting", () => {
      // Given
      const content = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([
        {
          description: content,
          element: { foo: content }
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });

    it("should build using default reporting as string", () => {
      // Given
      const content = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([
        {
          element: content
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: content
      });
    });

    it("should build using default reporting as number", () => {
      // Given
      const content = chance.integer();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([
        {
          element: content
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: `${content}`
      });
    });

    it("should build using default reporting as object", () => {
      // Given
      const content = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([
        {
          element: { foo: content }
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: `{"foo":"${content}"}`
      });
    });

    it("should build using default reporting excluding empty elements", () => {
      // Given
      const content = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([
        {
          element: { foo: content }
        },
        {
          element: ""
        }
      ]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: `{"foo":"${content}"}`
      });
    });
  });

  describe("title", () => {
    it("should build with no formatting", async () => {
      // Given
      const content = chance.string();
      const templateMessage = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([{ element: { title: content } }], { title: { template: templateMessage } });

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
      const templateMessage = "{{$.foo}}";
      const fooContent = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport(
        [
          {
            element: {
              textContent: content,
              foo: fooContent
            }
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
      const templateMessage = "{{$.foo}} {{bar}}";
      const fooContent = chance.string();
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport(
        [
          {
            element: {
              content,
              foo: fooContent
            }
          }
        ],
        {
          title: { template: templateMessage, match: /(?<bar>.+)/ }
        }
      );

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: `${fooContent} {"content":"${content}","foo":"${fooContent}"}`,
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
      const instance = new JsonReporter();

      // When
      const result = instance.buildReport([{ element: { content } }], {
        title: { template: templateMessage, match: /(?<foo>.+)/ }
      });

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: `{"content":"${content}"}`,
        description: "",
        image: "",
        url: ""
      });
    });
  });
});
