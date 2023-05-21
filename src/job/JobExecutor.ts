import { State, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";

export abstract class JobExecutor {
  protected abstract executeInternal(work: Work): Promise<ResultReport[]>;

  protected wrapState(result: ResultReport[]): State {
    return {
      lastUpdated: new Date(),
      data: result as any
    };
  }

  public async execute(work: Work): Promise<State> {
    const result = await this.executeInternal(work);
    return this.wrapState(result);
  }
}
