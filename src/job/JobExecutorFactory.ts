import { Injectable, ProviderType } from "@tsed/di";
import { JsonJobExecutor } from "./JsonJobExecutor";
import { HtmlJobExecutor } from "./HtmlJobExecutor";
import { JobExecutor } from "./JobExecutor";
import { Source } from "@any-sub/worker-transport";

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
        throw new UnhandledSourceTypeException();
    }
  }
}

export class UnhandledSourceTypeException extends Error {}
