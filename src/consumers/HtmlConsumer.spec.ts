import { expect } from "@jest/globals";
import { PlatformTest } from "@tsed/common";
import { HtmlConsumer } from "./HtmlConsumer";
import { Chance } from "chance";
import { LookupMode, Work } from "@any-sub/worker-transport";
import { HtmlReporter, ReportUnit } from "../reporters/HtmlReporter";
import { ResultReport } from "../model/Report";

const chance = new Chance();

const mockedDependencies = (resultReports: ResultReport[] = []) => [
  {
    token: HtmlReporter,
    use: {
      buildReport: (unit: ReportUnit[]): ResultReport[] => {
        return resultReports;
      }
    }
  }
];

describe("HTMLConsumer", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  const work = (containerLookup: string = "div#container", childrenLookup?: string): Work => ({
    type: "http",
    id: chance.string(),
    source: {
      location: chance.url(),
      type: "html"
    },
    consume: {
      lookup: {
        container: {
          mode: LookupMode.enum.css,
          value: containerLookup
        },
        ...(childrenLookup && { children: { mode: LookupMode.enum.css, value: childrenLookup } })
      }
    }
  });

  it("should create an instance", async () => {
    // When
    const deps = mockedDependencies([]);
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);

    // Then
    expect(instance).toBeInstanceOf(HtmlConsumer);
  });

  it("should throw when consuming non-html content", async () => {
    // Given
    const deps = mockedDependencies([]);
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);

    // When - Then
    expect(() => instance.consume(chance.string(), work())).toThrow();
  });

  it("should throw when using XPATH selector", async () => {
    // Given
    const deps = mockedDependencies([]);
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);
    const workOptions = work("div#container");
    workOptions.consume.lookup!.container.mode = LookupMode.enum.xpath;

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow();
  });

  it("should throw when using REGEX selector", async () => {
    // Given
    const deps = mockedDependencies([]);
    const instance = await PlatformTest.invoke<HtmlConsumer>(HtmlConsumer, deps);
    const workOptions = work("div#container");
    workOptions.consume.lookup!.container.mode = LookupMode.enum.regex;

    // When - Then
    expect(() => instance.consume(chance.string(), workOptions)).toThrow();
  });
});
