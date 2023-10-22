import { expect } from "@jest/globals";
import { LookupMode } from "@any-sub/worker-transport";
import { HtmlConsumer, HtmlReader, HtmlReporter } from "../../handlers/html";
import { mockedHttpFetch } from "../utils/Mocks";

describe("Reader -> Consumer integration", () => {
  it("should return content for a container", async () => {
    // Given
    const reader = new HtmlReader(mockedHttpFetch(`<div id="container">Some result</div>`));
    const consumer = new HtmlConsumer(new HtmlReporter());

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
        lookup: { mode: LookupMode.enum.css, value: "#container" }
      },
      report: {
        description: {
          template: "{{textContent}}"
        }
      }
    });

    // Then
    expect(result).toEqual([{ description: "Some result" }]);
  });
});
