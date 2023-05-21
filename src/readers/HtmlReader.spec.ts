import { expect } from "@jest/globals";
import { HtmlReader } from "./HtmlReader";
import { mockedHttpFetch } from "../__tests__/utils/Mocks";

describe("HtmlReader", () => {
  it("should create an instance", async () => {
    // When
    const instance = new HtmlReader(mockedHttpFetch());

    // Then
    expect(instance).toBeInstanceOf(HtmlReader);
  });

  it("should accept an HTTP URL as a parameter", async () => {
    // Given
    const instance = new HtmlReader(mockedHttpFetch());

    // When - Then
    await instance.read("https://local.host");
  });

  it("should not accept an string that is not a URL as a parameter", async () => {
    // Given
    const instance = new HtmlReader(mockedHttpFetch());

    // When - Then
    await expect(instance.read("foo")).rejects.toThrow();
  });

  it("should return the HTML contents of the provided URL", async () => {
    // Given
    const expectedHtml = `<html lang="en"><body><h1>Hello World!</h1></body></html>`;
    const instance = new HtmlReader(mockedHttpFetch(expectedHtml));

    // When
    const html = await instance.read("https://local.host");

    // Then
    expect(html).toEqual(expectedHtml);
  });

  it("should throw if result not successful", async () => {
    // Given
    const expectedHtml = `404: Not Found`;
    const instance = new HtmlReader(mockedHttpFetch(expectedHtml, 404));

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow(new Error(expectedHtml));
  });

  it("should throw if returned content type is not html", async () => {
    // Given
    const instance = new HtmlReader(mockedHttpFetch("", 200, "application/pdf"));

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow();
  });

  it("should return the HTML contents when the returned content type is suffixed", async () => {
    // Given
    const expectedHtml = `<html lang="en"><body><h1>Hello World!</h1></body></html>`;
    const instance = new HtmlReader(mockedHttpFetch(expectedHtml, 301, "text/html+someSuffix"));

    // When
    const html = await instance.read("https://local.host");

    // Then
    expect(html).toEqual(expectedHtml);
  });
});
