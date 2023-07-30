import { HttpSource } from "../readers";
import { ConsumeReportParts, LookupSettings, Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";
import { AbstractReportUnit } from "../reporters/Reporter";

export abstract class Consumer<T extends HttpSource> {
  public abstract consume(source: T, work: Work): ResultReport[];

  protected createReportUnit<T, R extends AbstractReportUnit<T> = AbstractReportUnit<T>>(
    element: T,
    lookupFn: (el: T, settings: LookupSettings) => T | undefined,
    parts?: Nullable<ConsumeReportParts>
  ): R {
    const unit = { element } as R;

    if (parts?.title) {
      unit.title = lookupFn(element, parts.title);
    }
    if (parts?.description) {
      unit.description = lookupFn(element, parts.description);
    }
    if (parts?.image) {
      unit.image = lookupFn(element, parts.image);
    }
    if (parts?.url) {
      unit.url = lookupFn(element, parts.url);
    }

    return unit;
  }
}
