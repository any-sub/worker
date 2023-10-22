import { Injectable } from "@tsed/di";
import { AbstractReportUnit, PartReporter, Reporter } from "../../reporters/Reporter";
import { Report, TextReporting } from "@any-sub/worker-transport";
import { JsonSource } from "../../readers";

@Injectable()
export class JsonReporter extends Reporter<JsonSource> {
  getDefaultReporter(): PartReporter<JsonSource> {
    return new TextReporter("title");
  }

  getTitleReporter(): PartReporter<JsonSource> {
    return new TextReporter("title");
  }

  getDescriptionReporter(): PartReporter<JsonSource> {
    return new TextReporter("description");
  }

  getImageReporter(): PartReporter<JsonSource> {
    return new TextReporter("image");
  }

  getUrlReporter(): PartReporter<JsonSource> {
    return new TextReporter("url");
  }
}

export type ReportUnit = AbstractReportUnit<JsonSource>;

class TextReporter extends PartReporter<JsonSource> {
  private readonly part: keyof Report;

  constructor(part: keyof Report) {
    super();
    this.part = part;
  }

  public build(element?: JsonSource, report?: Report, reportingElement?: JsonSource) {
    if (!element) return null;
    return this.buildText(element ?? reportingElement, report?.[this.part]);
  }

  private stringify(source: JsonSource): string {
    return typeof source === "string" ? source : JSON.stringify(source);
  }

  private buildText(element: JsonSource, report?: Nullable<TextReporting>, reportingElement?: JsonSource) {
    return this.reportTextElement(reportingElement ?? element, report);
  }

  private reportTextElement(element: JsonSource, options?: Nullable<TextReporting>) {
    const stringValue = this.stringify(element);
    const groups = (options?.match && stringValue?.match(options.match)?.groups) || {};
    return element ? this.reportText(options?.template ?? "", { ...{ $: element }, ...groups }) : "";
  }
}
