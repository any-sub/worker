import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { HtmlReader } from "./HtmlReader";
import { HttpFetch } from "../base";

const mockedDependencies = (content = "", code = 200, header: string = "text/html") => [
  {
    token: HttpFetch,
    use: {
      fetch: (_url: string) => {
        return new Promise((resolve) => {
          resolve({
            ok: code < 400,
            headers: {
              get: () => header
            },
            text: () => new Promise((resolve) => resolve(content))
          });
        });
      }
    }
  }
];

describe("HtmlReader", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should create an instance", async () => {
    // When
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader);

    // Then
    expect(instance).toBeInstanceOf(HtmlReader);
  });

  it("should accept an HTTP URL as a parameter", async () => {
    // Given
    const deps = mockedDependencies();
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);

    // When - Then
    await instance.read("https://local.host");
  });

  it("should not accept an string that is not a URL as a parameter", async () => {
    // Given
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader);

    // When - Then
    await expect(instance.read("foo")).rejects.toThrow();
  });

  it("should return the HTML contents of the provided URL", async () => {
    // Given
    const expectedHtml = `<html lang="en"><body><h1>Hello World!</h1></body></html>`;
    const deps = mockedDependencies(expectedHtml);
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);

    // When
    const html = await instance.read("https://local.host");

    // Then
    expect(html).toEqual(expectedHtml);
  });

  it("should throw if result not successful", async () => {
    // Given
    const expectedHtml = `404: Not Found`;
    const deps = mockedDependencies(expectedHtml, 404);
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow(new Error(expectedHtml));
  });

  it("should throw if returned content type is not html", async () => {
    // Given
    const deps = mockedDependencies("", 200, "application/pdf");
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow();
  });

  it("should return the HTML contents when the returned content type is suffixed", async () => {
    // Given
    const expectedHtml = `<html lang="en"><body><h1>Hello World!</h1></body></html>`;
    const deps = mockedDependencies(expectedHtml, 301, "text/html+someSuffix");
    const instance = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);

    // When
    const html = await instance.read("https://local.host");

    // Then
    expect(html).toEqual(expectedHtml);
  });
});
