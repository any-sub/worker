import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { JsonReader } from "./JsonReader";
import { HttpFetch } from "../base";

const mockedDependencies = (content = "", code = 200, header: string = "application/json") => [
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

describe("JsonReader", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should create an instance", async () => {
    // When
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader);

    // Then
    expect(instance).toBeInstanceOf(JsonReader);
  });

  it("should accept an HTTP URL as a parameter", async () => {
    // Given
    const deps = mockedDependencies();
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader, deps);

    // When - Then
    await instance.read("https://local.host");
  });

  it("should not accept an string that is not a URL as a parameter", async () => {
    // Given
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader);

    // When - Then
    await expect(instance.read("foo")).rejects.toThrow();
  });

  it("should return the JSON contents of the provided URL", async () => {
    // Given
    const expectedJSON = `{"a": "b"}`;
    const deps = mockedDependencies(expectedJSON);
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader, deps);

    // When
    const json = await instance.read("https://local.host");

    // Then
    expect(json).toEqual(expectedJSON);
  });

  it("should throw if result not successful", async () => {
    // Given
    const expectedJSON = `{"error": "404"}`;
    const deps = mockedDependencies(expectedJSON, 404);
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader, deps);

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow(new Error(expectedJSON));
  });

  it("should throw if returned content type is not json", async () => {
    // Given
    const deps = mockedDependencies("", 200, "application/pdf");
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader, deps);

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow();
  });

  it("should return the JSON contents when the returned content type is suffixed", async () => {
    // Given
    const expectedJSON = `{"a": "b"}`;
    const deps = mockedDependencies(expectedJSON, 301, "application/json+someSuffix");
    const instance = await PlatformTest.invoke<JsonReader>(JsonReader, deps);

    // When
    const json = await instance.read("https://local.host");

    // Then
    expect(json).toEqual(expectedJSON);
  });
});
