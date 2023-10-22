import { Injectable } from "@tsed/di";
import { AbstractReportUnit, PartReporter, Reporter } from "../../reporters/Reporter";
import { Report } from "@any-sub/worker-transport";
import { JsonSource } from "../../readers";

@Injectable()
export class JsonReporter extends Reporter<JsonSource> {
  getDefaultReporter(): PartReporter<JsonSource> {
    return new DefaultReporter();
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
    const el = element ?? reportingElement;
    if (!el) return null;

    const options = report?.[this.part];
    const stringValue = this.stringify(el);
    const groups = (options?.match && stringValue?.match(options.match)?.groups) || {};
    return this.reportText(options?.template ?? "", { ...{ $: el, $__string: stringValue }, ...groups });
  }

  private stringify(source: JsonSource): string {
    return typeof source === "string" ? source : JSON.stringify(source);
  }
}

class DefaultReporter extends TextReporter {
  constructor() {
    super("description");
  }

  public build(element?: JsonSource, report?: Report, reportingElement?: JsonSource) {
    return super.build(element, { description: { template: "{{$__string}}" } }, reportingElement);
  }
}
