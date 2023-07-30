import { expect } from "@jest/globals";
import { HtmlConsumer } from "./HtmlConsumer";
import { Chance } from "chance";
import { LookupMode, Work } from "@any-sub/worker-transport";
import { z } from "zod";

const chance = new Chance();
type LookupMode = z.infer<typeof LookupMode>;

describe("HTMLConsumer", () => {
  let mockHtmlReporter: any = { buildReport: jest.fn() };

  const work = (lookup: string = "div#container", mode: LookupMode = LookupMode.enum.css): Work => ({
    type: "http",
    id: chance.string(),
    source: {
      location: chance.url(),
      type: "html"
    },
    consume: {
      lookup: {
        mode,
        value: lookup
      }
    }
  });

  it("should create an instance", async () => {
    // When
    const instance = new HtmlConsumer(mockHtmlReporter);

    // Then
    expect(instance).toBeInstanceOf(HtmlConsumer);
  });

  it("should throw when consuming non-html content", async () => {
    // Given
    const instance = new HtmlConsumer(mockHtmlReporter);

    // When - Then
    expect(() => instance.consume(chance.string(), work())).toThrow("No element found.");
  });

  it("should throw when using XPATH selector", async () => {
    // Given
    const instance = new HtmlConsumer(mockHtmlReporter);
    const workOptions = work("div#container", LookupMode.enum.xpath);

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow("Only CSS selector is supported when consuming HTML");
  });

  it("should throw when using REGEX selector", async () => {
    // Given
    const instance = new HtmlConsumer(mockHtmlReporter);
    const workOptions = work("div#container", LookupMode.enum.regex);

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow("Only CSS selector is supported when consuming HTML");
  });
});
