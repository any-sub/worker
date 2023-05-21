import { Injectable } from "@tsed/di";
import { HttpFetch } from "../base";
import { HttpReader, JsonSource } from "./HttpReader";

@Injectable()
export class JsonReader extends HttpReader<JsonSource> {
  constructor(private readonly httpFetch: HttpFetch) {
    super();
  }

  protected getAcceptedContentType(): string {
    return "application/json";
  }

  public async read(rawURL: string) {
    const [contents] = await this.readURL(this.httpFetch, rawURL);
    return contents;
  }
}
