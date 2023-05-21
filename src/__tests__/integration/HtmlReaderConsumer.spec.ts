import { HtmlReader } from "../../readers";
import { HtmlConsumer, HtmlElementPropertyReader } from "../../consumers";
import { expect } from "@jest/globals";
import { LookupMode } from "@any-sub/worker-transport";
import { HtmlReporter } from "../../reporters/HtmlReporter";
import { mockedHttpFetch } from "../utils/Mocks";

describe("Reader -> Consumer integration", () => {
  it("should return content for a container", async () => {
    // Given
    const reader = new HtmlReader(mockedHttpFetch(`<div id="container">Some result</div>`));
    const consumer = new HtmlConsumer(new HtmlReporter(new HtmlElementPropertyReader()));

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
    expect(result).toHaveProperty("data", [{ description: "Some result" }]);
  });
});
