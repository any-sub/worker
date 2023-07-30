import { HtmlReader } from "../../../readers";
import { HtmlConsumer } from "../../../consumers";
import { expect } from "@jest/globals";
import { HtmlReporter } from "../../../reporters/HtmlReporter";
import { MockServer } from "jest-mock-server";
import { HttpFetch } from "../../../base";
import { HtmlJobExecutor } from "../../../job/HtmlJobExecutor";
import { Chance } from "chance";
import * as fs from "fs";
import * as path from "path";

const chance = new Chance();

const readHtmlSource = (name: string): string => {
  return fs.readFileSync(path.join(__dirname, `${name}.html`), "utf-8");
};

describe("HtmlJobExecutor integration", () => {
  const server = new MockServer();
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => server.reset());

  it("should report with default reporting", async () => {
    // Given
    const reader = new HtmlReader(new HttpFetch());
    const consumer = new HtmlConsumer(new HtmlReporter());
    const executor = new HtmlJobExecutor(reader, consumer);
    server.get("/").mockImplementation((ctx) => {
      ctx.status = 200;
      ctx.headers["content-type"] = "text/html";
      ctx.body = readHtmlSource("single-paragraph");
    });

    // When
    const result = (await executor.execute({
      source: {
        location: `${server.getURL().toString()}`,
        type: "html"
      },
      type: "http",
      id: "",
      consume: {}
    })) as any;

    // Then
    expect(result.data[0].description.trim()).toEqual("Foo");
  });
});
