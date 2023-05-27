import { Chance } from "chance";
import { JsonConsumer } from "./JsonConsumer";
import { expect } from "@jest/globals";
import { LookupMode, Work } from "@any-sub/worker-transport";

const chance = new Chance();

describe("JsonConsumer", () => {
  const mockReport = jest.fn() as any;
  let mockJsonReporter: any = { buildReport: jest.fn() };

  const work = (containerLookup: string = "$", childrenLookup?: string): Work => ({
    type: "http",
    id: chance.string(),
    source: {
      location: chance.url(),
      type: "json"
    },
    consume: {
      lookup: {
        container: {
          mode: LookupMode.enum.jsonpath,
          value: containerLookup
        },
        ...(childrenLookup && { children: { mode: LookupMode.enum.jsonpath, value: childrenLookup } })
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
    workOptions.consume.lookup!.container.mode = LookupMode.enum.xpath;

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
    const workOptions = work();
    workOptions.consume.lookup!.container.mode = "all";

    // When
    instance.consume([{ container: { title: "foo" } }], workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should consume an array source with children", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When
    instance.consume([{ container: { children: [{ title: "foo" }] } }], work("$.container", "$.children"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should throw for an array source with no containers", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When - Then
    expect(() => instance.consume([{ notAContainer: { title: "foo" } }], work("$..container"))).toThrow("Containers not found.");
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
    instance.consume({ container: { children: [{ title: "foo" }] } }, work("$.container", "$.children"));

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should consume an object source with all children", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work("$.container");
    workOptions.consume.lookup!.children! = { mode: "all", value: "" };

    // When
    instance.consume({ container: { children: [{ title: "foo" }] } }, workOptions);

    // Then
    expect(mockJsonReporter.buildReport).toHaveBeenCalledWith([{ element: { title: "foo" } }], mockReport);
  });

  it("should throw for an object source with no container", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);

    // When - Then
    expect(() => instance.consume({ notAContainer: { title: "foo" } }, work("$..container"))).toThrow("Container not found.");
  });

  it("should use source when container not specified for an array source", () => {
    // Given
    const instance = new JsonConsumer(mockJsonReporter);
    const workOptions = work();
    Reflect.deleteProperty(workOptions.consume.lookup!, "container");

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
          title: ["foo"]
        }
      ],
      mockReport
    );
  });
});
