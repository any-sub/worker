import { Consumer, ConsumerOptions, ElementLookupOptions, LookupMode } from "./Consumer";
import { HtmlSource } from "../readers";
import { State } from "../state/State";
import { Inject, Injectable } from "@tsed/di";
import { JSDOM } from "jsdom";
import Handlebars from "handlebars";
import { HtmlElementPropertyReader } from "./HtmlElementPropertyReader";

@Injectable()
export class HtmlConsumer extends Consumer<HtmlSource> {
  @Inject() propertyReader: HtmlElementPropertyReader;

  public consume(source: HtmlSource, options: ConsumerOptions): State {
    const dom = this.convert(source, options);
    const container = this.getContainer(dom, options.lookup.container);

    if (!container) {
      throw new Error("Container not found.");
    }

    const elements = this.getContentArray(options, container);
    return { data: this.buildReporting(options, elements) };
  }

  private buildReporting(options: ConsumerOptions, elements: Element[]): string[] {
    if (options.reporting) {
      const { search, messageTemplate } = options.reporting;

      if (!messageTemplate) {
        return elements.map((el) => el.textContent).filter((t) => t && search.test(t)) as string[];
      }

      const template = Handlebars.compile(messageTemplate);
      return this.buildReportingWithTemplate(elements, search, template);
    }

    return elements.map((el) => el.textContent).filter(Boolean) as string[];
  }

  private buildReportingWithTemplate(elements: Element[], search: RegExp, template: Handlebars.TemplateDelegate) {
    const content: string[] = [];

    for (const element of elements) {
      const groups = element.textContent?.match(search)?.groups;
      if (groups) {
        content.push(template({ ...this.propertyReader.read(element), ...groups }));
      }
    }

    return content;
  }

  private getContentArray(options: ConsumerOptions, container: Element): Element[] {
    const content: Element[] = [];
    if (options.lookup.children) {
      const children = this.getChildren(container, options.lookup.children);
      for (const child of children) {
        content.push(child);
      }
    } else {
      content.push(container);
    }
    return content;
  }

  private convert(source: HtmlSource, options: ConsumerOptions): JSDOM {
    return new JSDOM(source, {
      url: options.originURL?.toString()
    });
  }

  protected getContainer(dom: JSDOM, containerLookupOptions: ElementLookupOptions): Element | null {
    return this.lookup(dom.window.document, containerLookupOptions);
  }

  protected getChildren(container: Element, childrenLookupOptions: ElementLookupOptions): NodeListOf<Element> {
    return this.lookup(container, childrenLookupOptions, true);
  }

  protected lookup(element: Element | Document, options: ElementLookupOptions): Element | null;
  protected lookup(element: Element | Document, options: ElementLookupOptions, multiple: boolean): NodeListOf<Element>;
  protected lookup(
    element: Element | Document,
    { mode, value }: ElementLookupOptions,
    multiple: boolean = false
  ): Element | NodeList | null {
    if (multiple && mode === LookupMode.ALL) {
      return element.childNodes;
    }

    if (mode !== LookupMode.CSS) {
      // TODO
      throw new Error("CSS");
    }

    if (multiple) {
      return element.querySelectorAll(value);
    }
    return element.querySelector(value);
  }
}
