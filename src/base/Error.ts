export abstract class WorkerError extends Error {
  public static INTERNAL = "INTERNAL";

  public abstract get code(): string;
}

export class ElementNotFoundError extends WorkerError {
  public get code(): string {
    return "ELEMENT_NOT_FOUND";
  }

  public constructor() {
    super("Element not found");
  }
}

export class UnhandledSourceTypeError extends WorkerError {
  public get code(): string {
    return "UNHANDLED_SOURCE_TYPE";
  }

  public constructor() {
    super("Unhandled source type");
  }
}

export class MaxRetryReachedError extends WorkerError {
  public get code(): string {
    return "MAX_RETRY_REACHED";
  }

  public constructor() {
    super("Max retry reached");
  }
}

export class ContentTypeMismatchError extends WorkerError {
  public get code(): string {
    return "CONTENT_TYPE_MISMATCH";
  }

  public constructor() {
    super("Content type returned does not match");
  }
}

export class ResultNotOkError extends WorkerError {
  public get code(): string {
    return "RESULT_NOT_OK";
  }

  public constructor(contents: string) {
    super("Result not ok: " + contents);
  }
}
