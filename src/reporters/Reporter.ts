import { Report } from "@any-sub/worker-transport";
import Handlebars from "handlebars";
import { ResultReport } from "../model/Report";
import { isPresent } from "../util/TypeUtils";

export abstract class Reporter<T> {
  public abstract getDefaultReporter(): PartReporter<T>;

  public abstract getTitleReporter(): PartReporter<T>;

  public abstract getDescriptionReporter(): PartReporter<T>;

  public abstract getImageReporter(): PartReporter<T>;

  public abstract getUrlReporter(): PartReporter<T>;

  public buildReport(content: AbstractReportUnit<T>[], report?: Nullable<Report>): ResultReport[] {
    return report ? this.build(content, report) : this.buildDefault(content);
  }

  private build(content: AbstractReportUnit<T>[], report?: Report): ResultReport[] {
    return content.map((unit) => ({
      title: this.getTitleReporter().build(unit.title, report, unit.element),
      description: this.getDescriptionReporter().build(unit.title, report, unit.element),
      image: this.getImageReporter().build(unit.title, report, unit.element),
      url: this.getUrlReporter().build(unit.title, report, unit.element)
    }));
  }

  private buildDefault(content: AbstractReportUnit<T>[]): ResultReport[] {
    return content
      .map((el) => (el.title ? this.getTitleReporter().build(el.title) : this.getDefaultReporter().build(el.element)))
      .map((text) => text?.trim())
      .filter(isPresent)
      .map((description) => ({ description }));
  }
}

export type AbstractReportUnit<T> = Partial<Record<keyof Report, T>> & { element: T };

export abstract class PartReporter<T> {
  public abstract build(element?: T, report?: Report, reportingElement?: T): Nullable<string>;

  protected reportText(templateString: string, properties: Record<string, unknown>): string {
    const template = Handlebars.compile(templateString, { noEscape: true });
    return template(properties);
  }
}
