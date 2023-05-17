import { Reporter } from "./Reporter";
import { Inject, Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";
import { Report, TextReporting } from "@any-sub/worker-transport";
import { isPresent } from "../util/TypeUtils";
import { HtmlElementPropertyReader } from "../consumers";

@Injectable()
export class HtmlReporter extends Reporter {
  @Inject() propertyReader: HtmlElementPropertyReader;

  public buildReport(content: Element[], report?: Report): ResultReport[] {
    return report ? this.build(content, report) : this.buildDefault(content);
  }

  private build(content: Element[], report: Report): ResultReport[] {
    return content.map((el) => ({
      title: this.reportTextElement(el, report.title),
      description: this.reportTextElement(el, report.description)
    }));
  }

  private buildDefault(content: Element[]): ResultReport[] {
    return content.map((el) => el.textContent)
      .filter(isPresent)
      .map(description => ({ description }));
  }

  private reportTextElement(element: Element, options?: TextReporting) {
    const groups = options?.match ? element.textContent?.match(options.match)?.groups : {};
    return this.reportText(options?.template ?? "", { ...this.propertyReader.read(element), ...groups });
  }
}

