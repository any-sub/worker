import { Response } from "node-fetch";
import { HttpFetch } from "../base";

export abstract class HttpReader<T extends HttpSource> {
  public abstract read(url: string | URL): Promise<T>;

  protected abstract getAcceptedContentTypes(): string[];

  protected async readURL(httpFetch: HttpFetch, rawURL: string | URL): Promise<[contents: string, res: Response]> {
    const url = new URL(rawURL);

    const res = await httpFetch.fetch(url, {
      headers: {
        Accept: this.getAcceptedContentTypes().join(",")
      }
    });

    if (!this.getAcceptedContentTypes().find((type) => res.headers.get("content-type")?.startsWith(type))) {
      throw new Error("Content type returned does not match");
    }

    const contents = await res.text();

    if (!res.ok) {
      throw new Error(contents);
    }

    return [contents, res];
  }
}

export type HttpSource = XmlSource | HtmlSource | JsonSource;
export type XmlSource = string;
export type HtmlSource = string;
export type JsonSource = string | number | boolean | { [x: string]: JsonSource } | Array<JsonSource>;
