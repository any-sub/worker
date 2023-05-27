import { Injectable } from "@tsed/di";
import { AbstractReportUnit, Reporter } from "./Reporter";
import { Report } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { JsonSource } from "../readers";

@Injectable()
export class JsonReporter extends Reporter<JsonSource> {
  public buildReport(content: ReportUnit[], report?: Report): ResultReport[] {
    return [];
  }
}

export type ReportUnit = AbstractReportUnit<JsonSource>;
