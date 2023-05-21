import { expect } from "@jest/globals";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";
import { JSDOM } from "jsdom";

const html = `
<div>Div</div>
<a href="https://local.host/foo">Anchor<a>
<img src="https://local.host/foo"/>
`;

const document = new JSDOM(html).window.document;

describe("HtmlElementPropertyReader", () => {
  it("should create an instance", () => {
    // When
    const instance = new HtmlElementPropertyReader();

    // Then
    expect(instance).toBeInstanceOf(HtmlElementPropertyReader);
  });

  it("should read properties for a non-defined element", () => {
    // Given
    const instance = new HtmlElementPropertyReader();

    // When
    const properties = instance.read(document.querySelector("div")!);

    // Then
    expect(properties).toEqual({ textContent: "Div" });
  });

  it("should read properties for an anchor", () => {
    // Given
    const instance = new HtmlElementPropertyReader();

    // When
    const properties = instance.read(document.querySelector("a")!);

    // Then
    expect(properties).toEqual({
      link: "https://local.host/foo",
      href: "https://local.host/foo",
      textContent: "Anchor"
    });
  });

  it("should read properties for an image", () => {
    // Given
    const instance = new HtmlElementPropertyReader();

    // When
    const properties = instance.read(document.querySelector("img")!);

    // Then
    expect(properties).toEqual({ link: "https://local.host/foo", src: "https://local.host/foo" });
  });
});
