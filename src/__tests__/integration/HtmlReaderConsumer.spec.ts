import { PlatformTest } from "@tsed/common";
import { HttpFetch } from "../../base";
import { HtmlReader } from "../../readers";
import { HtmlConsumer } from "../../consumers";
import { expect } from "@jest/globals";
import { LookupMode } from "@any-sub/worker-transport";

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

describe("Reader -> Consumer integration", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should return content for a container", async () => {
    // Given
    const deps = mockedDependencies(`<div id="container">Some result</div>`);
    const reader = await PlatformTest.invoke<HtmlReader>(HtmlReader, deps);
    const consumer = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer);

    // When
    const url = "https://local.host";
    const result = consumer.consume(await reader.read(url), {
      source: {
        location: url,
        type: "html"
      },
      type: "http",
      id: "",
      consume: {
        lookup: {
          container: { mode: LookupMode.enum.css, value: "#container" }
        }
      }
    });

    // Then
    expect(result).toHaveProperty("data", ["Some result"]);
  });
});
