import { HttpSource } from "../readers";
import { State } from "../state/State";

export abstract class Consumer<T extends HttpSource> {
  public abstract consume(source: T, options: ConsumerOptions): State;
}

export type ConsumerOptions = {
  originURL: URL;
  lookup: LookupOptions;
  reporting?: ReportingOptions;
};

export type LookupOptions = {
  container: ElementLookupOptions;
  children?: ElementLookupOptions;
};

export type ElementLookupOptions = {
  mode: LookupMode;
  value: string;
};

export enum LookupMode {
  CSS = "CSS",
  XPATH = "XPATH",
  REGEX = "REGEX",
  /**
   * Return all child elements of the current top-most level element
   */
  ALL = "ALL"
}

export type ReportingOptions = {
  search: RegExp;
  messageTemplate?: string;
};
