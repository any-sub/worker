import { HttpSource } from "../readers";
import { State, Work } from "@any-sub/worker-transport";

export abstract class Consumer<T extends HttpSource> {
  public abstract consume(source: T, work: Work): State;
}
