import { attachLogger, InjectorService } from "@tsed/di";
import { ConnectionManager } from "./socket/ConnectionManager";
import { initLogging } from "./config/logger";

setInterval(() => {
  console.debug("Keep alive");
}, 1 << 30);

(async function bootstrap() {
  const injector = new InjectorService();
  attachLogger(injector, initLogging());
  await injector.load();
  const manager = injector.invoke<ConnectionManager>(ConnectionManager);
  await manager.connect();
})().catch(console.error);
