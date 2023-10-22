import { Report } from "@any-sub/worker-transport";
import Handlebars from "handlebars";
import { ResultReport } from "../model/Report";

export abstract class Reporter<T> {
  public abstract getDefaultReporter(): PartReporter<T>;

  public abstract getTitleReporter(): PartReporter<T>;

  public abstract getDescriptionReporter(): PartReporter<T>;

  public abstract getImageReporter(): PartReporter<T>;

  public abstract getUrlReporter(): PartReporter<T>;

  public buildReport(content: AbstractReportUnit<T>[], report?: Nullable<Report>): ResultReport[] {
    return content
      .map((unit) => ({
        title: this.getTitleReporter().build(unit.title, report, unit.element),
        description: report
          ? this.getDescriptionReporter().build(unit.description, report, unit.element)
          : this.getDefaultReporter().build(unit.description, undefined, unit.element),
        image: this.getImageReporter().build(unit.image, report, unit.element),
        url: this.getUrlReporter().build(unit.url, report, unit.element)
      }))
      .map(this.excludeNulls)
      .filter(this.isNotEmpty);
  }

  private excludeNulls(unit: ResultReport): ResultReport {
    const report: ResultReport = {};
    Object.entries(unit).forEach(([key, value]) => {
      if (value) {
        report[key as keyof ResultReport] = value;
      }
    });
    return report;
  }

  private isNotEmpty(unit: ResultReport): boolean {
    return Boolean(unit.title || unit.description || unit.image || unit.url);
  }
}

export type AbstractReportUnit<T> = Partial<Record<keyof Report, T>> & { element: T };

export abstract class PartReporter<T> {
  public abstract build(element?: T, report?: Nullable<Report>, reportingElement?: T): Nullable<string>;

  protected reportText(templateString: string, properties: Record<string, unknown>): string {
    const template = Handlebars.compile(templateString, { noEscape: true });
    return template(properties);
  }
}
