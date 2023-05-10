import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { HtmlConsumer } from "./HtmlConsumer";
import { Chance } from "chance";
import { ConsumerOptions, LookupMode } from "./Consumer";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";

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

  const options = (containerLookup: string = "div#container", childrenLookup?: string) =>
    ({
      originURL: new URL(chance.url()),
      lookup: {
        container: {
          mode: LookupMode.CSS,
          value: containerLookup
        },
        ...(childrenLookup && { children: { mode: LookupMode.CSS, value: childrenLookup } })
      }
    } as ConsumerOptions);

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
    expect(() => instance.consume(chance.string(), options())).toThrow();
  });

  it("should throw when using XPATH selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container");
    consumerOptions.lookup.container.mode = LookupMode.XPATH;

    // When - Then
    expect(() => instance.consume(chance.string(), consumerOptions)).toThrow();
  });

  it("should throw when using REGEX selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container");
    consumerOptions.lookup.container.mode = LookupMode.REGEX;

    // When - Then
    expect(() => instance.consume(chance.string(), consumerOptions)).toThrow();
  });

  it("should get content from the container by css selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When
    const result = instance.consume(`<div id="container">Hello</div>`, options());

    // Then
    expect(result).toEqual({ data: ["Hello"] });
  });

  it("should get content from the container children by css selector", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When
    const result = instance.consume(
      `<div id="container"><p class="foo">Hey</p><p>Hello</p><p class="foo">There</p></div>`,
      options("div#container", "p.foo")
    );

    // Then
    expect(result).toEqual({ data: ["Hey", "There"] });
  });

  it("should get content from all the container's children", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container", "p.foo");
    consumerOptions.lookup.children!.mode = LookupMode.ALL;

    // When
    const result = instance.consume(
      `<div id="container"><p class="foo">Hey</p><p>Hello</p><p class="foo">There</p></div>`,
      consumerOptions
    );

    // Then
    expect(result).toEqual({ data: ["Hey", "Hello", "There"] });
  });

  it("should only get content from the container when matching reporting expression", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container");
    consumerOptions.reporting = {
      search: /(?<number>\d+)/i
    };

    // When
    const result = instance.consume(`<div id="container">We don't have any.</div>`, consumerOptions);

    // Then
    expect(result).toEqual({ data: [] });
  });

  it("should get content from the container and tokenize result", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container");
    consumerOptions.reporting = {
      search: /(?<number>\d+)/i,
      messageTemplate: "Current number: {{number}}"
    };

    // When
    const result = instance.consume(`<div id="container">We have 32.</div>`, consumerOptions);

    // Then
    expect(result).toEqual({ data: ["Current number: 32"] });
  });

  it("should get content from the container's children and apply template", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container", "p");
    consumerOptions.reporting = {
      search: /(?<number>\d+)/i,
      messageTemplate: "Current numbers: {{number}}"
    };

    // When
    const result = instance.consume(`<div id="container">We have 32.<p>We also have 24.</p><p>No, we have 15.</p></div>`, consumerOptions);

    // Then
    expect(result).toEqual({ data: ["Current numbers: 24", "Current numbers: 15"] });
  });

  it("should only get content from the container's children that match the reporting expression and apply template", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);
    const consumerOptions = options("div#container", "p");
    consumerOptions.reporting = {
      search: /(?<number>\d+)/i,
      messageTemplate: "Current numbers: {{number}}"
    };

    // When
    const result = instance.consume(
      `<div id="container"><p>We don't have any</p><p>We also have 24.</p><p>No, we have 15.</p></div>`,
      consumerOptions
    );

    // Then
    expect(result).toEqual({ data: ["Current numbers: 24", "Current numbers: 15"] });
  });

  it("should get content from the container's children and apply template with element properties", async () => {
    // Given
    const consumerOptions = options("div#container", "a");
    consumerOptions.reporting = {
      search: /(?<number>\d+)/i,
      messageTemplate: "Current numbers: {{number}} {{link}}"
    };
    const url = consumerOptions.originURL.origin;
    const deps = mockedDependencies({ link: `${url}/foo` });
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);

    // When
    const result = instance.consume(`<div id="container">We have 32.<a href="/foo">We also have 24.</a></div>`, consumerOptions);

    // Then
    expect(result).toEqual({ data: [`Current numbers: 24 ${url}/foo`] });
  });
});
