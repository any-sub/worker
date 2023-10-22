import { JobExecutor } from "../../job/JobExecutor";
import { Work } from "@any-sub/worker-transport";
import { ResultReport } from "../../model/Report";
import { HtmlConsumer } from "./HtmlConsumer";
import { Injectable } from "@tsed/di";
import { HtmlReader } from "./HtmlReader";

@Injectable()
export class HtmlJobExecutor extends JobExecutor {
  constructor(
    private readonly reader: HtmlReader,
    private readonly consumer: HtmlConsumer
  ) {
    super();
  }

  public async executeInternal(work: Work): Promise<ResultReport[]> {
    const source = await this.reader.read(work.source.location);
    return this.consumer.consume(source, work);
  }
}
