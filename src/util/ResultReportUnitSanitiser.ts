import { Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";

@Injectable()
export class ResultReportUnitSanitiser {
  public sanitise(unit: ResultReport): ResultReport {
    return {
      ...this.sanitiseField("title", unit.title),
      ...this.sanitiseField("description", unit.description),
      ...this.sanitiseField("image", unit.image),
      ...this.sanitiseField("url", unit.url)
    };
  }

  private sanitiseField(fieldName: keyof ResultReport, fieldValue?: string): ResultReport | undefined {
    return fieldValue
      ? {
          [fieldName]: this.sanitiseValue(fieldValue)
        }
      : undefined;
  }

  private sanitiseValue(value: string) {
    return value.trim().substring(0, 255);
  }
}
