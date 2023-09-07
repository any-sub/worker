import { Injectable, ProviderScope, Scope } from "@tsed/di";
import { Logger } from "@tsed/logger";
import { SocketClient } from "./Socket";
import { delay } from "../base";
import { MaxRetryReachedError } from "../base/Error";

@Injectable()
@Scope(ProviderScope.SINGLETON)
export class ConnectionManager {
  constructor(
    private readonly logger: Logger,
    private readonly client: SocketClient
  ) {}

  private static RETRY_WAIT = 1000 * 2;
  private static MAX_RETRIES = 30;
  private retries = 0;

  public async connect() {
    try {
      this.client.connect((err) => {
        if (err) {
          this.logger.info(err);
          this.retry();
        } else {
          this.retries = 0;
        }
      });
    } catch (err) {
      this.logger.error(err);
      await this.retry();
    }
  }

  private async retry() {
    if (++this.retries <= ConnectionManager.MAX_RETRIES) {
      this.logger.info(`Socket connection retrying attempt #${this.retries}`);
      await delay(ConnectionManager.RETRY_WAIT);
      await this.connect();
    } else {
      throw new MaxRetryReachedError();
    }
  }
}
