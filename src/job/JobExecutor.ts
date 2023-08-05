import { State, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { Inject } from "@tsed/di";
import { ResultReportUnitSanitiser } from "../util/ResultReportUnitSanitiser";

export abstract class JobExecutor {
  @Inject() sanitiser: ResultReportUnitSanitiser;

  protected abstract executeInternal(work: Work): Promise<ResultReport[]>;

  protected wrapState(result: ResultReport[]): State {
    return {
      lastUpdated: new Date(),
      data: result as any
    };
  }

  public async execute(work: Work): Promise<State> {
    const result = await this.executeInternal(work);
    return this.wrapState(result.map((unit) => this.sanitiser.sanitise(unit)));
  }
}
