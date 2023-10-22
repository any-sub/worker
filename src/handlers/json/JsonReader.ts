import { Injectable } from "@tsed/di";
import { HttpFetch } from "../../base";
import { HttpReader, JsonSource } from "../../readers";

@Injectable()
export class JsonReader extends HttpReader<JsonSource> {
  constructor(private readonly httpFetch: HttpFetch) {
    super();
  }

  protected getAcceptedContentTypes(): string[] {
    return ["application/json"];
  }

  public async read(rawURL: string) {
    const [contents] = await this.readURL(this.httpFetch, rawURL);
    return JSON.parse(contents);
  }
}
