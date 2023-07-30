import { Inject, Injectable } from "@tsed/di";
import { Work } from "@any-sub/worker-transport";
import { JobExecutorFactory } from "../job/JobExecutorFactory";
import { Logger } from "@tsed/logger";

@Injectable()
export class SocketHandler {
  @Inject() logger: Logger;

  constructor(private readonly jobExecutorFactory: JobExecutorFactory) {}

  public async work(work: Work) {
    this.logger.info(`Starting job ${work.id}`);
    const executor = this.jobExecutorFactory.create(work.source);
    const result = await executor.execute(work);
    this.logger.info(`Finished job ${work.id}`);
    return result;
  }
}
