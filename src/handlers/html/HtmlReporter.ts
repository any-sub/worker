import { AbstractReportUnit, PartReporter, Reporter } from "../../reporters/Reporter";
import { Injectable } from "@tsed/di";
import { Report } from "@any-sub/worker-transport";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";

@Injectable()
export class HtmlReporter extends Reporter<Element> {
  getDefaultReporter(): PartReporter<Element> {
    return new TextReporter("title"); // TODO:
  }

  getTitleReporter(): PartReporter<Element> {
    return new TextReporter("title");
  }

  getDescriptionReporter(): PartReporter<Element> {
    return new TextReporter("description");
  }

  getImageReporter(): PartReporter<Element> {
    return new AttributeReporter("image", "src");
  }

  getUrlReporter(): PartReporter<Element> {
    return new AttributeReporter("url", "href");
  }
}

export type ReportUnit = AbstractReportUnit<Element>;

class TextReporter extends PartReporter<Element> {
  private readonly part: keyof Report;
  private readonly propertyReader = new HtmlElementPropertyReader();

  constructor(part: keyof Report) {
    super();
    this.part = part;
  }

  public build(element?: Element, report?: Report, reportingElement?: Element) {
    const el = element ?? reportingElement;
    if (!el) return null;
    const options = report?.[this.part];
    const groups = (options?.match && el.textContent?.match(options.match)?.groups) || {};
    return this.reportText(options?.template ?? "", { ...this.propertyReader.read(el), ...groups });
  }
}

class AttributeReporter extends PartReporter<Element> {
  private readonly part: keyof Report;
  private readonly attribute: string;
  private readonly propertyReader = new HtmlElementPropertyReader();

  constructor(part: keyof Report, attribute: string) {
    super();
    this.part = part;
    this.attribute = attribute;
  }

  public build(element?: Element, report?: Report, reportingElement?: Element) {
    const el = element ?? reportingElement;
    if (!el) return null;
    return this.propertyReader.read(el)[this.attribute];
  }
}
