import { JobExecutor } from "../../job/JobExecutor";
import { Work } from "@any-sub/worker-transport";
import { ResultReport } from "../../model/Report";
import { JsonConsumer } from "./JsonConsumer";
import { Injectable } from "@tsed/di";
import { JsonReader } from "./JsonReader";

@Injectable()
export class JsonJobExecutor extends JobExecutor {
  constructor(
    private readonly reader: JsonReader,
    private readonly consumer: JsonConsumer
  ) {
    super();
  }

  protected async executeInternal(work: Work): Promise<ResultReport[]> {
    const source = await this.reader.read(work.source.location);
    return this.consumer.consume(source, work);
  }
}
