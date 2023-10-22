import { Consumer } from "../../consumers";
import { JsonSource } from "../../readers";
import { ConsumeReportParts, LookupMode, LookupSettings, Report, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../../model/Report";
import jp from "jsonpath";
import { isPresent } from "../../util/TypeUtils";
import { JsonReporter } from "./JsonReporter";
import { Injectable } from "@tsed/di";
import { ElementNotFoundError } from "../../base";

@Injectable()
export class JsonConsumer extends Consumer<JsonSource> {
  private static readonly ROOT_LOOKUP: LookupSettings = { mode: "jsonpath", value: "$" };

  constructor(private readonly reporter: JsonReporter) {
    super();
  }

  public consume(source: JsonSource, { consume, report }: Work): ResultReport[] {
    const elements = this.lookup(source, consume.lookup ?? JsonConsumer.ROOT_LOOKUP).filter(isPresent);

    if (!elements || !elements.length) {
      throw new ElementNotFoundError();
    }

    return this.buildReporting(elements, consume.parts, report);
  }

  private buildReporting(elements: JsonSource[], parts?: Nullable<ConsumeReportParts>, options?: Nullable<Report>): ResultReport[] {
    const units = elements.map((element) =>
      this.createReportUnit(
        element,
        (element, settings) => {
          const result = this.lookup(element, settings);
          return result.length === 1 ? result[0] : result;
        },
        parts
      )
    );
    return this.reporter.buildReport(units, options);
  }

  private lookup(source: JsonSource, options: LookupSettings): JsonSource[] {
    if (options.mode === LookupMode.enum.all) {
      if (options.value) {
        const elements = jp.query(source, options.value);
        return elements.map((element) => jp.query(element, "$.*")).flat();
      }
      return jp.query(source, "$.*").flat();
    }

    if (options.mode !== LookupMode.enum.jsonpath) {
      throw new Error("Only JSONPATH is supported when consuming json");
    }

    return jp.query(source, options.value).flat();
  }
}
