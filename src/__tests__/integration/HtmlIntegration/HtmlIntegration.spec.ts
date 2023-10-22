import { expect } from "@jest/globals";
import { HtmlConsumer, HtmlJobExecutor, HtmlReader, HtmlReporter } from "../../../handlers/html";
import { MockServer } from "jest-mock-server";
import { HttpFetch } from "../../../base";
import { Chance } from "chance";
import * as fs from "fs";
import * as path from "path";
import { ResultReportUnitSanitiser } from "../../../util/ResultReportUnitSanitiser";
import { ResultReportHasher } from "../../../util/ResultReportHasher";

const chance = new Chance();

const readHtmlSource = (name: string): string => {
  return fs.readFileSync(path.join(__dirname, `${name}.html`), "utf-8");
};

describe("HtmlJobExecutor integration", () => {
  let executor: HtmlJobExecutor;
  const server = new MockServer();
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => {
    server.reset();
    const reader = new HtmlReader(new HttpFetch());
    const consumer = new HtmlConsumer(new HtmlReporter());
    executor = new HtmlJobExecutor(reader, consumer);
    executor.sanitiser = new ResultReportUnitSanitiser();
    executor.hasher = new ResultReportHasher();
  });

  it("should report with default reporting", async () => {
    // Given
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
