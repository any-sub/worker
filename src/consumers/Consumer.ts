import { HttpSource } from "../readers";
import { Work } from "@any-sub/worker-transport";
import { ResultReport } from "../model/Report";

export abstract class Consumer<T extends HttpSource> {
  public abstract consume(source: T, work: Work): ResultReport[];
}
