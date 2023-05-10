import { Inject, Injectable } from "@tsed/di";
import { HttpFetch } from "../base";
import { HttpReader, JsonSource } from "./HttpReader";

@Injectable()
export class JsonReader extends HttpReader<JsonSource> {
  @Inject() httpFetch: HttpFetch;

  protected getAcceptedContentType(): string {
    return "application/json";
  }

  public async read(rawURL: string) {
    const [contents] = await this.readURL(this.httpFetch, rawURL);
    return contents;
  }
}
