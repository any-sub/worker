import { Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";

@Injectable()
export class ResultReportUnitSanitiser {
  public sanitise(unit: ResultReport, baseURL: string): ResultReport {
    return {
      ...this.sanitiseField("title", unit.title),
      ...this.sanitiseField("description", unit.description),
      ...this.sanitiseURL(baseURL, "image", unit.image),
      ...this.sanitiseURL(baseURL, "url", unit.url)
    };
  }

  private sanitiseField(fieldName: keyof ResultReport, fieldValue?: string): ResultReport | undefined {
    return fieldValue
      ? {
          [fieldName]: this.sanitiseValue(fieldValue)
        }
      : undefined;
  }

  private makeURL(baseURL: string, path: string): string {
    const url = new URL(path, baseURL);
    return url.href;
  }

  private sanitiseURL(baseURL: string, fieldName: keyof ResultReport, fieldValue?: string): ResultReport | undefined {
    return fieldValue
      ? {
          [fieldName]: this.makeURL(baseURL, this.sanitiseValue(fieldValue))
        }
      : undefined;
  }

  private sanitiseValue(value: string) {
    return value.trim().substring(0, 255);
  }
}
