import { expect } from "@jest/globals";
import { JsonReader } from "./JsonReader";
import { mockedHttpFetch } from "../__tests__/utils/Mocks";

const mockedJsonHttpFetch = (content = "{}", status = 200) => {
  return mockedHttpFetch(content, status, "application/json");
};

describe("JsonReader", () => {
  it("should create an instance", async () => {
    // When
    const instance = new JsonReader(mockedJsonHttpFetch());

    // Then
    expect(instance).toBeInstanceOf(JsonReader);
  });

  it("should accept an HTTP URL as a parameter", async () => {
    // Given
    const instance = new JsonReader(mockedJsonHttpFetch());

    // When - Then
    await instance.read("https://local.host");
  });

  it("should not accept an string that is not a URL as a parameter", async () => {
    // Given
    const instance = new JsonReader(mockedJsonHttpFetch());

    // When - Then
    await expect(instance.read("foo")).rejects.toThrow();
  });

  it("should return the JSON contents of the provided URL", async () => {
    // Given
    const expectedJSON = `{"a": "b"}`;
    const instance = new JsonReader(mockedJsonHttpFetch(expectedJSON, 200));

    // When
    const json = await instance.read("https://local.host");

    // Then
    expect(json).toEqual({ a: "b" });
  });

  it("should return the JSON array contents of the provided URL", async () => {
    // Given
    const expectedJSON = `[{"a": "b"}]`;
    const instance = new JsonReader(mockedJsonHttpFetch(expectedJSON, 200));

    // When
    const json = await instance.read("https://local.host");

    // Then
    expect(json).toEqual([{ a: "b" }]);
  });

  it("should throw if result not successful", async () => {
    // Given
    const expectedJSON = `{"error": "404"}`;
    const instance = new JsonReader(mockedJsonHttpFetch(expectedJSON, 404));

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow(new Error(expectedJSON));
  });

  it("should throw if returned content type is not json", async () => {
    // Given
    const instance = new JsonReader(mockedHttpFetch("", 200, "application/pdf"));

    // When - Then
    await expect(instance.read("https://local.host")).rejects.toThrow();
  });

  it("should return the JSON contents when the returned content type is suffixed", async () => {
    // Given
    const expectedJSON = `{"a": "b"}`;
    const instance = new JsonReader(mockedHttpFetch(expectedJSON, 301, "application/json+someSuffix"));

    // When
    const json = await instance.read("https://local.host");

    // Then
    expect(json).toEqual({ a: "b" });
  });
});
