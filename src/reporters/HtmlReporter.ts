import { AbstractReportUnit, Reporter } from "./Reporter";
import { Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";
import { Report, TextReporting } from "@any-sub/worker-transport";
import { isPresent } from "../util/TypeUtils";
import { HtmlElementPropertyReader } from "../consumers";

@Injectable()
export class HtmlReporter extends Reporter<Element> {
  constructor(private readonly propertyReader: HtmlElementPropertyReader) {
    super();
  }

  public buildReport(content: ReportUnit[], report?: Report): ResultReport[] {
    return report ? this.build(content, report) : this.buildDefault(content);
  }

  private build(content: ReportUnit[], report: Report): ResultReport[] {
    return content.map((unit) => ({
      title: this.buildText(unit.element, report.title, unit.title),
      description: this.buildText(unit.element, report.description, unit.description),
      image: this.buildAttr(unit.element, "src", report.image, unit.description),
      url: this.buildAttr(unit.element, "href", report.url, unit.description)
    }));
  }

  private buildText(element: Element, report?: TextReporting, reportingElement?: Element) {
    return this.reportTextElement(reportingElement ?? element, report);
  }

  private buildAttr(element: Element, attribute: string, report?: TextReporting, reportingElement?: Element) {
    return (
      this.reportElementAttribute(reportingElement ?? element, attribute) ?? this.reportTextElement(reportingElement ?? element, report)
    );
  }

  private buildDefault(content: ReportUnit[]): ResultReport[] {
    return content
      .map((el) => el.description?.textContent ?? el.element.textContent)
      .filter(isPresent)
      .map((description) => ({ description }));
  }

  private reportTextElement(element: Element, options?: TextReporting) {
    const groups = (options?.match && element.textContent?.match(options.match)?.groups) || {};
    return this.reportText(options?.template ?? "", { ...this.propertyReader.read(element), ...groups });
  }

  private reportElementAttribute(element: Element, attributeName: string) {
    return this.propertyReader.read(element)[attributeName];
  }
}

export type ReportUnit = AbstractReportUnit<Element>;
