import { Inject, Injectable } from "@tsed/di";
import { Logger } from "@tsed/logger";
import { Work } from "@any-sub/worker-transport";

@Injectable()
export class SocketHandler {
  constructor(private readonly logger: Logger) {}

  public async work(work: Work) {
    return [`pong`, work];
  }
}
