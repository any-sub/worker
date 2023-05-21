import { Consumer } from "./Consumer";
import { HtmlSource } from "../readers";
import { Injectable } from "@tsed/di";
import { JSDOM } from "jsdom";
import { Consume, ConsumeReportParts, LookupMode, LookupSettings, Report, State, Work } from "@any-sub/worker-transport";
import { HtmlReporter, ReportUnit } from "../reporters/HtmlReporter";
import { ResultReport } from "../model/Report";

@Injectable()
export class HtmlConsumer extends Consumer<HtmlSource> {
  private static readonly BODY_LOOKUP: LookupSettings = { mode: "css", value: "body" };

  constructor(private readonly reporter: HtmlReporter) {
    super();
  }

  public consume(source: HtmlSource, { source: { location }, consume, report }: Work): State {
    const dom = this.convert(source, location);
    const container = consume.lookup ? this.getContainer(dom, consume.lookup.container) : this.getContainer(dom, HtmlConsumer.BODY_LOOKUP);

    if (!container) {
      throw new Error("Container not found.");
    }

    const elements = this.getContentArray(consume, container);
    return { data: this.buildReporting(elements, consume.parts, report) as any, lastUpdated: new Date() };
  }

  private buildReporting(elements: Element[], parts?: ConsumeReportParts, options?: Report): ResultReport[] {
    const units = elements.map((element) => {
      const unit: ReportUnit = { element };

      if (parts?.title) {
        unit.title = this.lookup(element, parts.title) || undefined;
      }

      if (parts?.description) {
        unit.description = this.lookup(element, parts.description) || undefined;
      }

      if (parts?.image) {
        unit.image = this.lookup(element, parts.image) || undefined;
      }

      if (parts?.url) {
        unit.url = this.lookup(element, parts.url) || undefined;
      }

      return unit;
    });

    return this.reporter.buildReport(units, options);
  }

  private getContentArray(options: Consume, container: Element): Element[] {
    const content: Element[] = [];
    if (options.lookup?.children) {
      const children = this.getChildren(container, options.lookup.children);
      for (const child of children) {
        content.push(child);
      }
    } else {
      content.push(container);
    }
    return content;
  }

  private convert(source: HtmlSource, url: string): JSDOM {
    return new JSDOM(source, {
      url
    });
  }

  protected getContainer(dom: JSDOM, containerLookupOptions: LookupSettings): Element | null {
    return this.lookup(dom.window.document, containerLookupOptions);
  }

  protected getChildren(container: Element, childrenLookupOptions: LookupSettings): NodeListOf<Element> {
    return this.lookup(container, childrenLookupOptions, true);
  }

  protected lookup(element: Element | Document, options: LookupSettings): Element | null;
  protected lookup(element: Element | Document, options: LookupSettings, multiple: boolean): NodeListOf<Element>;
  protected lookup(element: Element | Document, { mode, value }: LookupSettings, multiple: boolean = false): Element | NodeList | null {
    if (multiple && mode === LookupMode.enum.all) {
      return element.childNodes;
    }

    if (mode !== LookupMode.enum.css) {
      // TODO
      throw new Error("CSS");
    }

    if (multiple) {
      return element.querySelectorAll(value);
    }
    return element.querySelector(value);
  }
}
