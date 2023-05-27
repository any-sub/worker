import { Report } from "@any-sub/worker-transport";
import Handlebars from "handlebars";
import { ResultReport } from "../model/Report";

export abstract class Reporter<T> {
  public abstract buildReport(content: AbstractReportUnit<T>[], report?: Report): ResultReport[];

  public reportText(templateString: string, properties: Record<string, unknown>) {
    const template = Handlebars.compile(templateString, { noEscape: true });
    return template(properties);
  }
}

export type AbstractReportUnit<T> = Partial<Record<keyof Report, T>> & { element: T };
