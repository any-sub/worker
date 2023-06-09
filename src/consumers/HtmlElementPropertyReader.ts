import { Injectable } from "@tsed/di";

@Injectable()
export class HtmlElementPropertyReader {
  public read(element: Element): Record<string, string> {
    const properties: Record<string, string> = {};

    for (const attrName of element.getAttributeNames()) {
      const value = element.getAttribute(attrName);
      if (value) {
        properties[attrName] = value;
      }
    }

    const textContent = element.textContent;
    if (textContent) {
      properties.textContent = textContent;
    }

    if (this.isAnchor(element)) {
      properties.link = element.href;
    }
    if (this.isImage(element)) {
      properties.link = element.src;
    }

    return properties;
  }

  private isAnchor(element: Element): element is HTMLAnchorElement {
    return element.tagName === "A";
  }

  private isImage(element: Element): element is HTMLImageElement {
    return element.tagName === "IMG";
  }
}
