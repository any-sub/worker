import { JsonReader } from "../../../readers";
import { expect } from "@jest/globals";
import { MockServer } from "jest-mock-server";
import { HttpFetch } from "../../../base";
import { Chance } from "chance";
import * as fs from "fs";
import * as path from "path";
import { JsonConsumer } from "../../../consumers/JsonConsumer";
import { JsonReporter } from "../../../reporters/JsonReporter";
import { JsonJobExecutor } from "../../../job/JsonJobExecutor";

const chance = new Chance();

const readJsonSource = (name: string): string => {
  return fs.readFileSync(path.join(__dirname, `${name}.json`), "utf-8");
};

describe("JsonJobExecutor integration", () => {
  const server = new MockServer();
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => server.reset());

  it("should report with default reporting for single string", async () => {
    // Given
    const reader = new JsonReader(new HttpFetch());
    const consumer = new JsonConsumer(new JsonReporter());
    const executor = new JsonJobExecutor(reader, consumer);
    server.get("/").mockImplementation((ctx) => {
      ctx.status = 200;
      ctx.response.set({ "content-type": "application/json" });
      ctx.body = readJsonSource("single-string");
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
    expect(result.data[0].description.trim()).toEqual("Foo");
  });

  it("should report with default reporting for object", async () => {
    // Given
    const reader = new JsonReader(new HttpFetch());
    const consumer = new JsonConsumer(new JsonReporter());
    const executor = new JsonJobExecutor(reader, consumer);
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
    const reader = new JsonReader(new HttpFetch());
    const consumer = new JsonConsumer(new JsonReporter());
    const executor = new JsonJobExecutor(reader, consumer);
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
          container: {
            mode: "jsonpath",
            value: "$.details"
          },
          children: {
            mode: "jsonpath",
            value: "$.updates"
          }
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
        description: {
          template: `{{second}} {{first}}`,
          match: /^(?<first>\w+) with some (?<second>\w+) value$/i
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
    expect(result!.data).toEqual([
      {
        title: "Title1",
        description: "foo Desc1",
        image: "http://someurl/14533.png",
        url: "http://someurl/14533"
      },
      {
        title: "Title2",
        description: "bar Desc2",
        image: "http://someurl/22554.png",
        url: "http://someurl/22554"
      }
    ]);
  });
});
