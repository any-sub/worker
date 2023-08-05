import { State, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { Inject } from "@tsed/di";
import { ResultReportUnitSanitiser } from "../util/ResultReportUnitSanitiser";
import { ResultReportHasher } from "../util/ResultReportHasher";

export abstract class JobExecutor {
  @Inject() sanitiser: ResultReportUnitSanitiser;
  @Inject() hasher: ResultReportHasher;

  protected abstract executeInternal(work: Work): Promise<ResultReport[]>;

  protected wrapState(result: ResultReport[]): State {
    return {
      lastUpdated: new Date(),
      data: result
        .map((unit) => this.sanitiser.sanitise(unit))
        .map((unit) => ({
          ...unit,
          hash: this.hasher.hash(unit)
        }))
    };
  }

  public async execute(work: Work): Promise<State> {
    const result = await this.executeInternal(work);
    return this.wrapState(result);
  }
}
