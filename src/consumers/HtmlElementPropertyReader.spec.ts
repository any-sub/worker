import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";
import { JSDOM } from "jsdom";

const html = `
<div>Div</div>
<a href="https://local.host/foo">Anchor<a>
<img src="https://local.host/foo"/>
`;

const document = new JSDOM(html).window.document;

describe("HtmlElementPropertyReader", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should create an instance", async () => {
    // When
    const instance = await PlatformTest.invoke<HtmlElementPropertyReader>(HtmlElementPropertyReader);

    // Then
    expect(instance).toBeInstanceOf(HtmlElementPropertyReader);
  });

  it("should read properties for a non-defined element", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlElementPropertyReader>(HtmlElementPropertyReader);

    // When
    const properties = instance.read(document.querySelector("div")!);

    // Then
    expect(properties).toEqual({});
  });

  it("should read properties for an anchor", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlElementPropertyReader>(HtmlElementPropertyReader);

    // When
    const properties = instance.read(document.querySelector("a")!);

    // Then
    expect(properties).toEqual({ link: "https://local.host/foo" });
  });

  it("should read properties for an image", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlElementPropertyReader>(HtmlElementPropertyReader);

    // When
    const properties = instance.read(document.querySelector("img")!);

    // Then
    expect(properties).toEqual({ link: "https://local.host/foo" });
  });
});
