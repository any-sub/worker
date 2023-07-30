import { Injectable } from "@tsed/di";
import { io, Socket } from "socket.io-client";
import { Logger } from "@tsed/logger";
import { SOCKET_URI } from "../config";
import { SocketHandler } from "./SocketHandler";
import { WorkParser } from "@any-sub/worker-transport";

@Injectable()
export class SocketClient {
  constructor(
    private readonly logger: Logger,
    private readonly handler: SocketHandler
  ) {}

  private socket: Socket;

  public connect(callback: (err?: any) => void) {
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

    this.socket.on("work", async (work) => {
      try {
        const result = await this.handler.work(WorkParser.parse(work));
        this.socket.emit("result", JSON.stringify(result));
      } catch (err) {
        this.logger.error(err);
        this.socket.emit("error", err.message);
      }
    });

    this.socket.connect();
  }
}
