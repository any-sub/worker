import { Injectable } from "@tsed/di";
import { io, Socket } from "socket.io-client";
import { Logger } from "@tsed/logger";
import { SOCKET_URI } from "../config";
import { SocketHandler } from "./SocketHandler";
import { State, WorkError, WorkParser } from "@any-sub/worker-transport";
import { WorkerError } from "../base/Error";

@Injectable()
export class SocketClient {
  constructor(
    private readonly logger: Logger,
    private readonly handler: SocketHandler
  ) {}

  private socket: Socket;

  public connect(callback: (err?: unknown) => void) {
    if (!this.socket) {
      this.socket = io(SOCKET_URI);
    } else {
      this.socket.removeAllListeners();
    }

    this.socket.on("connect", () => {
      this.logger.info("Socket connected");
      callback();
    });
    this.socket.on("disconnect", (reason, description) => {
      this.logger.warn(`Socket disconnected`);
      this.socket.close();
      callback({ reason, description });
    });
    this.socket.on("connect_error", (err) => {
      this.logger.warn("Socket connection error");
      this.socket.close();
      callback(err);
    });

    this.socket.on("work", async (workString) => {
      try {
        const work = WorkParser.parse(workString);
        try {
          this.sendResult(await this.handler.work(work));
        } catch (err) {
          this.sendError(err, work.id);
        }
      } catch (err) {
        this.sendError(err);
      }
    });

    this.socket.connect();
  }

  private sendResult(resultState: State) {
    this.socket.emit("result", JSON.stringify(resultState));
  }

  private sendError(err: Error, workId?: string) {
    const error: WorkError = {
      id: workId,
      code: err instanceof WorkerError ? err.code : WorkerError.INTERNAL,
      message: err.message
    };
    this.logger.error(err);
    this.socket.emit("error", JSON.stringify(error));
  }
}
