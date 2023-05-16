import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { HtmlConsumer } from "./HtmlConsumer";
import { Chance } from "chance";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";
import { LookupMode, Work } from "@any-sub/worker-transport";

const chance = new Chance();

const mockedDependencies = (properties = {}) => [
  {
    token: HtmlElementPropertyReader,
    use: {
      read: (element: Element) => properties
    }
  }
];

describe("HTMLConsumer", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  const work = (containerLookup: string = "div#container", childrenLookup?: string): Work =>
    ({
      type: "http",
      id: chance.string(),
      source: {
        location: chance.url(),
        type: "html"
      },
      consume: {
        lookup: {
          container: {
            mode: LookupMode.enum.css,
            value: containerLookup
          },
          ...(childrenLookup && { children: { mode: LookupMode.enum.css, value: childrenLookup } })
        }
      }
    });

  it("should create an instance", async () => {
    // When
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // Then
    expect(instance).toBeInstanceOf(HtmlConsumer);
  });

  it("should throw when consuming non-html content", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When - Then
    expect(() => instance.consume(chance.string(), work())).toThrow();
  });

  it("should throw when using XPATH selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container");
    workOptions.consume.lookup!.container.mode = LookupMode.enum.xpath;

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow();
  });

  it("should throw when using REGEX selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container");
    workOptions.consume.lookup!.container.mode = LookupMode.enum.regex;

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow();
  });

  it("should get content from the container by css selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When
    const result = instance.consume(`<div id="container">Hello</div>`, work());

    // Then
    expect(result).toHaveProperty("data", ["Hello"]);
  });

  it("should get content from the container children by css selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When
    const result = instance.consume(
      `<div id="container"><p class="foo">Hey</p><p>Hello</p><p class="foo">There</p></div>`,
      work("div#container", "p.foo")
    );

    // Then
    expect(result).toHaveProperty("data", ["Hey", "There"]);
  });

  it("should get content from all the container's children", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container", "p.foo");
    workOptions.consume.lookup!.children!.mode = LookupMode.enum.all;

    // When
    const result = instance.consume(
      `<div id="container"><p class="foo">Hey</p><p>Hello</p><p class="foo">There</p></div>`,
      workOptions
    );

    // Then
    expect(result).toHaveProperty("data", ["Hey", "Hello", "There"]);
  });

  it("should only get content from the container when matching reporting expression", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container");
    workOptions.report = {
      title: {
        match: /(?<number>\d+)/i
      }
    };

    // When
    const result = instance.consume(`<div id="container">We don't have any.</div>`, workOptions);

    // Then
    expect(result).toHaveProperty("data", []);
  });

  it("should get content from the container and tokenize result", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container");
    workOptions.report = {
      title: {
        match: /(?<number>\d+)/i,
        template: "Current number: {{number}}"
      }
    };

    // When
    const result = instance.consume(`<div id="container">We have 32.</div>`, workOptions);

    // Then
    expect(result).toHaveProperty("data", ["Current number: 32"]);
  });

  it("should get content from the container's children and apply template", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container", "p");
    workOptions.report = {
      title: {
        match: /(?<number>\d+)/i,
        template: "Current numbers: {{number}}"
      }
    };

    // When
    const result = instance.consume(`<div id="container">We have 32.<p>We also have 24.</p><p>No, we have 15.</p></div>`, workOptions);

    // Then
    expect(result).toHaveProperty("data", ["Current numbers: 24", "Current numbers: 15"]);
  });

  it("should only get content from the container's children that match the reporting expression and apply template", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const workOptions = work("div#container", "p");
    workOptions.report = {
      title: {
        match: /(?<number>\d+)/i,
        template: "Current numbers: {{number}}"
      }
    };

    // When
    const result = instance.consume(
      `<div id="container"><p>We don't have any</p><p>We also have 24.</p><p>No, we have 15.</p></div>`,
      workOptions
    );

    // Then
    expect(result).toHaveProperty("data", ["Current numbers: 24", "Current numbers: 15"]);
  });

  it("should get content from the container's children and apply template with element properties", async () => {
    // Given
    const workOptions = work("div#container", "a");
    workOptions.report = {
      title: {
        match: /(?<number>\d+)/i,
        template: "Current numbers: {{number}} {{link}}"
      }
    };
    const url = workOptions.source.location;
    const deps = mockedDependencies({ link: `${url}/foo` });
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);

    // When
    const result = instance.consume(`<div id="container">We have 32.<a href="/foo">We also have 24.</a></div>`, workOptions);

    // Then
    expect(result).toHaveProperty("data", [`Current numbers: 24 ${url}/foo`]);
  });
});
