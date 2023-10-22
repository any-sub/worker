import { Injectable } from "@tsed/di";
import { ResultReport } from "../model/Report";

@Injectable()
export class ResultReportUnitSanitiser {
  public sanitise(unit: ResultReport, baseURL: string): ResultReport {
    return {
      ...this.sanitiseField("title", 250, unit.title),
      ...this.sanitiseField("description", 500, unit.description),
      ...this.sanitiseURL(baseURL, "image", unit.image),
      ...this.sanitiseURL(baseURL, "url", unit.url)
    };
  }

  private sanitiseField(fieldName: keyof ResultReport, maxLength: number, fieldValue?: Nullable<string>): ResultReport | undefined {
    return fieldValue
      ? {
          [fieldName]: this.sanitiseValue(fieldValue).substring(0, maxLength)
        }
      : undefined;
  }

  private makeURL(baseURL: string, pathRaw: string): string {
    const path = this.sanitiseValue(pathRaw);
    let url;
    try {
      url = new URL(path);
    } catch (_) {
      url = new URL(path, baseURL);
    }
    return url.href;
  }

  private sanitiseURL(baseURL: string, fieldName: keyof ResultReport, fieldValue?: Nullable<string>): ResultReport | undefined {
    return fieldValue
      ? {
          [fieldName]: this.makeURL(baseURL, this.sanitiseValue(fieldValue)).substring(0, 2048)
        }
      : undefined;
  }

  private sanitiseValue(value: string) {
    return value.trim();
  }
}
