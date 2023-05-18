import { Report } from "@any-sub/worker-transport";
import Handlebars from "handlebars";
import { ResultReport } from "../model/Report";

export abstract class Reporter {
  public abstract buildReport(content: unknown, report?: Report): ResultReport[];

  public reportText(templateString: string, properties: Record<string, unknown>) {
    const template = Handlebars.compile(templateString, { noEscape: true });
    return template(properties);
  }
}
