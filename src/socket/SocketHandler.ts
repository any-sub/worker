import { Inject, Injectable } from "@tsed/di";
import { Logger } from "@tsed/logger";

@Injectable()
export class SocketHandler {
  @Inject() logger: Logger;

  public async work(data: any) {
    return [`pong`, data];
  }
}
