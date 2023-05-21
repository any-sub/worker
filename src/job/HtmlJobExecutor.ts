import { JobExecutor } from "./JobExecutor";
import { Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { HtmlReader } from "../readers";
import { HtmlConsumer } from "../consumers";
import { Injectable } from "@tsed/di";

@Injectable()
export class HtmlJobExecutor extends JobExecutor {
  constructor(private readonly reader: HtmlReader, private readonly consumer: HtmlConsumer) {
    super();
  }

  public async executeInternal(work: Work): Promise<ResultReport[]> {
    const source = await this.reader.read(work.source.location);
    return this.consumer.consume(source, work);
  }
}
