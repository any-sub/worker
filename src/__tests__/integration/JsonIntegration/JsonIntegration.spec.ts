import { JsonReader } from "../../../readers";
import { expect } from "@jest/globals";
import { MockServer } from "jest-mock-server";
import { HttpFetch } from "../../../base";
import * as fs from "fs";
import * as path from "path";
import { JsonConsumer } from "../../../consumers";
import { JsonReporter } from "../../../reporters/JsonReporter";
import { JsonJobExecutor } from "../../../job/JsonJobExecutor";
import { ResultReportUnitSanitiser } from "../../../util/ResultReportUnitSanitiser";
import { ResultReportHasher } from "../../../util/ResultReportHasher";

const readJsonSource = (name: string): string => {
  return fs.readFileSync(path.join(__dirname, `${name}.json`), "utf-8");
};

describe("JsonJobExecutor integration", () => {
  let executor: JsonJobExecutor;
  const server = new MockServer();
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => {
    server.reset();
    const reader = new JsonReader(new HttpFetch());
    const consumer = new JsonConsumer(new JsonReporter());
    executor = new JsonJobExecutor(reader, consumer);
    executor.sanitiser = new ResultReportUnitSanitiser();
    executor.hasher = new ResultReportHasher();
  });

  it("should throw for single string", async () => {
    // Given
    server.get("/").mockImplementation((ctx) => {
      ctx.status = 200;
      ctx.response.set({ "content-type": "application/json" });
      ctx.body = readJsonSource("single-string");
    });

    // When - Then
    await expect(
      executor.execute({
        source: {
          location: `${server.getURL().toString()}`,
          type: "json"
        },
        type: "http",
        id: "",
        consume: {}
      })
    ).rejects.toThrow("obj needs to be an object");
  });

  it("should report with default reporting for object", async () => {
    // Given

    server.get("/").mockImplementation((ctx) => {
      ctx.status = 200;
      ctx.response.set({ "content-type": "application/json" });
      ctx.body = readJsonSource("simple-object");
    });

    // When
    const result = (await executor.execute({
      source: {
        location: `${server.getURL().toString()}`,
        type: "json"
      },
      type: "http",
      id: "",
      consume: {}
    })) as any;

    // Then
    expect(result.data[0].description.trim()).toEqual(`{"values":[{"foo":"bar"}]}`);
  });

  it("should report with complex reporting", async () => {
    // Given
    server.get("/").mockImplementation((ctx) => {
      ctx.status = 200;
      ctx.response.set({ "content-type": "application/json" });
      ctx.body = readJsonSource("complex-object");
    });

    // When
    const result = await executor.execute({
      source: {
        location: `${server.getURL().toString()}`,
        type: "json"
      },
      type: "http",
      id: "",
      consume: {
        lookup: {
          mode: "jsonpath",
          value: "$.details.updates.*"
        },
        parts: {
          title: {
            mode: "jsonpath",
            value: "$.heading"
          },
          description: {
            mode: "jsonpath",
            value: "$.body"
          },
          url: {
            mode: "jsonpath",
            value: "$.id"
          },
          image: {
            mode: "jsonpath",
            value: "$.id"
          }
        }
      },
      report: {
        title: {
          template: "{{$}}"
        },
        description: {
          template: `{{second}} {{first}}`,
          match: "^(?<first>\\w+) with some (?<second>\\w+) value$"
        },
        image: {
          template: "http://someurl/{{$}}.png"
        },
        url: {
          template: "http://someurl/{{$}}"
        }
      }
    });

    // Then
    expect(result!.data).toMatchSnapshot();
  });
});
