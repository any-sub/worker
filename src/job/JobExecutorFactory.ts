import { Injectable, ProviderType } from "@tsed/di";
import { JsonJobExecutor } from "../handlers/json";
import { HtmlJobExecutor } from "../handlers/html";
import { JobExecutor } from "./JobExecutor";
import { Source } from "@any-sub/worker-transport";
import { UnhandledSourceTypeError } from "../base";

@Injectable({
  type: ProviderType.FACTORY
})
export class JobExecutorFactory {
  constructor(
    private readonly json: JsonJobExecutor,
    private readonly html: HtmlJobExecutor
  ) {}

  public create({ type }: Source): JobExecutor {
    switch (type) {
      case "json":
        return this.json;
      case "html":
        return this.html;
      default:
        throw new UnhandledSourceTypeError();
    }
  }
}
