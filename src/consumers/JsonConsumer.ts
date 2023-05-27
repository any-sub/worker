import { Consumer } from "./Consumer";
import { JsonSource } from "../readers";
import { Consume, ConsumeReportParts, LookupMode, LookupSettings, Report, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import jp from "jsonpath";
import { isArray, isPresent } from "../util/TypeUtils";
import { JsonReporter } from "../reporters/JsonReporter";

export class JsonConsumer extends Consumer<JsonSource> {
  constructor(private readonly reporter: JsonReporter) {
    super();
  }

  public consume(source: JsonSource, { consume, report }: Work): ResultReport[] {
    let elements: JsonSource[];
    const containerLookup = consume.lookup?.container;
    if (isArray(source)) {
      const containers = source.map((listElement) => this.getContainer(listElement, containerLookup)).filter(isPresent);

      if (!containers.length) {
        throw new Error("Containers not found.");
      }

      elements = containers.map((container) => this.getContentArray(container!, consume)).flat();
    } else {
      const container = this.getContainer(source, containerLookup);

      if (!container) {
        throw new Error("Container not found.");
      }

      elements = this.getContentArray(container, consume);
    }

    return this.buildReporting(elements, consume.parts, report);
  }

  private buildReporting(elements: JsonSource[], parts?: ConsumeReportParts, options?: Report): ResultReport[] {
    const units = elements.map((element) => this.createReportUnit(element, (element, settings) => this.lookup(element, settings), parts));
    return this.reporter.buildReport(units, options);
  }

  private getContainer(source: JsonSource, containerLookupOptions?: LookupSettings): JsonSource | undefined {
    const container = containerLookupOptions ? this.lookup(source, containerLookupOptions) : source;
    return isArray(container) ? container[0] : container;
  }

  private getContentArray(source: JsonSource, consume: Consume): JsonSource[] {
    const childrenLookup = consume.lookup?.children;
    if (childrenLookup) {
      return this.lookup(source, childrenLookup);
    }
    return [source];
  }

  private lookup(source: JsonSource, options: LookupSettings): JsonSource[] {
    if (options.mode === LookupMode.enum.all) {
      return jp.query(source, "$.*").flat();
    }

    if (options.mode !== LookupMode.enum.jsonpath) {
      throw new Error("Only JSONPATH is supported when consuming json");
    }

    const result = jp.query(source, options.value).flat();
    return result.length === 1 ? result[0] : result;
  }
}
