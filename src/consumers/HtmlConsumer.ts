import { Consumer } from "./Consumer";
import { HtmlSource } from "../readers";
import { Injectable } from "@tsed/di";
import { JSDOM } from "jsdom";
import { ConsumeReportParts, LookupMode, LookupSettings, Report, Work } from "@any-sub/worker-transport";
import { HtmlReporter } from "../reporters/HtmlReporter";
import { ResultReport } from "../model/Report";

@Injectable()
export class HtmlConsumer extends Consumer<HtmlSource> {
  private static readonly BODY_LOOKUP: LookupSettings = { mode: "css", value: "body" };

  constructor(private readonly reporter: HtmlReporter) {
    super();
  }

  public consume(source: HtmlSource, { source: { location }, consume, report }: Work): ResultReport[] {
    const dom = this.convert(source, location);
    const elements = consume.lookup ? this.getElements(dom, consume.lookup) : this.getElements(dom, HtmlConsumer.BODY_LOOKUP);

    if (!elements || !elements.length) {
      throw new Error("No element found.");
    }

    return this.buildReporting(elements, consume.parts, report);
  }

  private buildReporting(elements: Element[], parts?: Nullable<ConsumeReportParts>, options?: Nullable<Report>): ResultReport[] {
    const units = elements.map((element) =>
      this.createReportUnit(element, (el, settings) => this.lookup(el, settings) || undefined, parts)
    );
    return this.reporter.buildReport(units, options);
  }

  private convert(source: HtmlSource, url: string): JSDOM {
    return new JSDOM(source, {
      url
    });
  }

  protected getElements(dom: JSDOM, containerLookupOptions: LookupSettings): Element[] {
    return this.lookup(dom.window.document, containerLookupOptions, true);
  }

  protected lookup(element: Element | Document, options: LookupSettings): Nullable<Element>;
  protected lookup(element: Element | Document, options: LookupSettings, multiple: boolean): Element[];
  protected lookup(element: Element | Document, { mode, value }: LookupSettings, multiple: boolean = false): Nullable<Element> | Element[] {
    if (multiple && mode === LookupMode.enum.all) {
      if (value) {
        const elements = this.lookup(element, { mode: LookupMode.enum.css, value }, true);
        return elements.map((el) => this.toElementArray(el.childNodes)).flat();
      }
      return this.toElementArray(element.childNodes);
    }

    if (mode !== LookupMode.enum.css) {
      // TODO
      throw new Error("Only CSS selector is supported when consuming HTML");
    }

    if (multiple) {
      return this.toElementArray(element.querySelectorAll(value));
    }
    return element.querySelector(value) as Nullable<Element>;
  }

  private toElementArray(elements: Nullable<NodeListOf<Element | ChildNode>>): Element[] {
    const content: Element[] = [];
    for (const element of elements ?? []) {
      content.push(element as Element);
    }
    return content;
  }
}
