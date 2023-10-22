import { State, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { Inject } from "@tsed/di";
import { ResultReportUnitSanitiser } from "../util/ResultReportUnitSanitiser";
import { ResultReportHasher } from "../util/ResultReportHasher";

export abstract class JobExecutor {
  @Inject() sanitiser: ResultReportUnitSanitiser;
  @Inject() hasher: ResultReportHasher;

  protected abstract executeInternal(work: Work): Promise<ResultReport[]>;

  protected wrapState(work: Work, result: ResultReport[]): State {
    const baseURL = work.source.location;
    return {
      id: work.id,
      lastUpdated: new Date().toISOString(),
      data: result
        .map((unit) => this.sanitiser.sanitise(unit, baseURL))
        .map((unit) => ({
          ...unit,
          hash: this.hasher.hash(unit)
        }))
    };
  }

  public async execute(work: Work): Promise<State> {
    const result = await this.executeInternal(work);
    return this.wrapState(work, result);
  }
}
