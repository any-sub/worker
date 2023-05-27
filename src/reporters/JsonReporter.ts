import { Injectable } from "@tsed/di";
import { AbstractReportUnit, Reporter } from "./Reporter";
import { Report, TextReporting } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { JsonSource } from "../readers";
import { isPresent } from "../util/TypeUtils";

@Injectable()
export class JsonReporter extends Reporter<JsonSource> {
  public buildReport(content: ReportUnit[], report?: Report): ResultReport[] {
    return report ? this.build(content, report) : this.buildDefault(content);
  }

  private build(content: ReportUnit[], report: Report): ResultReport[] {
    return content.map((unit) => ({
      title: this.buildText(unit.element, report?.title, unit.title),
      description: this.buildText(unit.element, report?.description, unit.description),
      image: this.buildText(unit.element, report?.image, unit.image),
      url: this.buildText(unit.element, report?.url, unit.url)
    }));
  }

  private buildDefault(content: ReportUnit[]): ResultReport[] {
    return content
      .map((el) => this.stringify(el.description ?? el.element))
      .filter(isPresent)
      .map((description) => ({ description }));
  }

  private stringify(source: JsonSource): string {
    return typeof source === "string" ? source : JSON.stringify(source);
  }

  private buildText(element: JsonSource, report?: TextReporting, reportingElement?: JsonSource) {
    return this.reportTextElement(reportingElement ?? element, report);
  }

  private reportTextElement(element: JsonSource, options?: TextReporting) {
    const stringValue = this.stringify(element);
    const groups = (options?.match && stringValue?.match(options.match)?.groups) || {};
    return this.reportText(options?.template ?? stringValue, { ...{ $: element }, ...groups });
  }
}

export type ReportUnit = AbstractReportUnit<JsonSource>;
