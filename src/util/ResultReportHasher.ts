import { Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";
import { createHash } from "crypto";

@Injectable()
export class ResultReportHasher {
  public hash(unit: ResultReport): string {
    return createHash("md5").update(JSON.stringify(unit)).digest("hex");
  }
}
