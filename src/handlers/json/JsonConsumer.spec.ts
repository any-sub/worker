import { Chance } from "chance";
import { JsonConsumer } from "./JsonConsumer";
import { expect } from "@jest/globals";
import { LookupMode, Work } from "@any-sub/worker-transport";
import { z } from "zod";
import { ElementNotFoundError } from "../../base";

const chance = new Chance();
type LookupMode = z.infer<typeof LookupMode>;

describe("JsonConsumer", () => {
  const mockReport = jest.fn() as any;
  let mockJsonReporter: any = { buildReport: jest.fn() };

  const work = (lookup: string = "$", mode: LookupMode = LookupMode.enum.jsonpath): Work => ({
    type: "http",
    id: chance.string(),
    source: {
      location: chance.url(),
      type: "json"
    },
    consume: {
      lookup: {
        mode,
        value: lookup
      }
    },
    report: mockReport
  });

  it("should create an instance", async () => {
    // When
    const instance = new JsonConsumer(mockJsonReporter);

    // Then
    expect(instance).toBeInstanceOf(JsonConsumer);
  });

  it("should throw when consuming non-json content", async () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When - Then
    expect(() => instance.consume("{]", work())).toThrow("obj needs to be an object");
  });

  it("should throw when not using jsonpath selector", async () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work("div#container");
    workOptions.consume.lookup!.mode = LookupMode.enum.xpath;

    // When - Then
    expect(() => instance.consume({ foo: "bar" }, workOptions)).toThrow("Only JSONPATH is supported when consuming json");
  });

  it("should consume an array source", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When
    instance.consume([{ container: { title: "foo" } }], work("$..container"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should consume an array source with all containers", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work("$", LookupMode.enum.all);

    // When
    instance.consume([{ container: { title: "foo" } }], workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { container: { title: "foo" } } }], mockReport);
  });

  it("should consume an array source with children", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When
    instance.consume([{ container: { children: [{ title: "foo" }] } }], work("$..container.children"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should throw for an array source with no containers", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When - Then
    expect(() => instance.consume([{ notAContainer: { title: "foo" } }], work("$..container"))).toThrow(ElementNotFoundError);
  });

  it("should consume an object source", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When
    instance.consume({ container: { title: "foo" } }, work("$.container"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should consume an object source with children", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When
    instance.consume({ container: { children: [{ title: "foo" }] } }, work("$.container.children"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should consume an object source with all children", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work("$.container.children", LookupMode.enum.all);

    // When
    instance.consume({ container: { children: [{ title: "foo" }] } }, workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should throw for an object source with no container", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When - Then
    expect(() => instance.consume({ notAContainer: { title: "foo" } }, work("$..container"))).toThrow(ElementNotFoundError);
  });

  it("should use source when container not specified for an array source", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work();
    Reflect.deleteProperty(workOptions.consume, "lookup");

    // When
    instance.consume([{ title: "foo" }], workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should look up parts for reporting unit", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work("$.container");
    workOptions.consume.parts = { title: { mode: "jsonpath", value: "$.title" } };

    // When
    instance.consume({ container: { title: "foo" } }, workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith(
      [
        {
          element: { title: "foo" },
          title: "foo"
        }
      ],
      mockReport
    );
  });
});
