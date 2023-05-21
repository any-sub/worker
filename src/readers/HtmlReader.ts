import { Injectable } from "@tsed/di";
import { HttpFetch } from "../base";
import { HtmlSource, HttpReader } from "./HttpReader";

@Injectable()
export class HtmlReader extends HttpReader<HtmlSource> {
  constructor(private readonly httpFetch: HttpFetch) {
    super();
  }

  protected getAcceptedContentType(): string {
    return "text/html";
  }

  public async read(rawURL: string | URL) {
    const [contents] = await this.readURL(this.httpFetch, rawURL);
    return contents;
  }
}
