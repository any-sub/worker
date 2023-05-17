import { Consumer } from "./Consumer";
import { HtmlSource } from "../readers";
import { Inject, Injectable } from "@tsed/di";
import { JSDOM } from "jsdom";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";
import { Consume, LookupMode, LookupSettings, Report, State, TextReporting, Work } from "@any-sub/worker-transport";
import { Reporter } from "../reporters/Reporter";

@Injectable()
export class HtmlConsumer extends Consumer<HtmlSource> {
  @Inject() propertyReader: HtmlElementPropertyReader;
  @Inject() reporter: Reporter;

  private static readonly BODY_LOOKUP: LookupSettings = { mode: "css", value: "body" };

  public consume(source: HtmlSource, { source: { location }, consume, report }: Work): State {
    const dom = this.convert(source, location);
    const container = consume.lookup ? this.getContainer(dom, consume.lookup.container) : this.getContainer(dom, HtmlConsumer.BODY_LOOKUP);

    if (!container) {
      throw new Error("Container not found.");
    }

    const elements = this.getContentArray(consume, container);
    return { data: this.buildReporting(elements, report), lastUpdated: new Date() };
  }

  private buildReporting(elements: Element[], options?: Report): string[] {
    if (options) {
      // TODO
      const { title } = options ?? {};

      if (!title?.template) {
        return elements.map((el) => el.textContent).filter((t) => t && (title?.match ?? /.*/).test(t)) as string[];
      }

      return this.buildReportingWithTemplate(elements, title);
    }

    return elements.map((el) => el.textContent).filter(Boolean) as string[];
  }

  private buildReportingWithTemplate(elements: Element[], title: TextReporting) {
    const content: string[] = [];

    for (const element of elements) {
      const groups = element.textContent?.match(title.match ?? /.*/)?.groups;
      if (groups) {
        content.push(this.reporter.reportText(title.template ?? "", { ...this.propertyReader.read(element), ...groups }));
      }
    }

    return content;
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
  protected lookup(
    element: Element | Document,
    { mode, value }: LookupSettings,
    multiple: boolean = false
  ): Element | NodeList | null {
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
