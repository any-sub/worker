import { parseEnv } from "znv";
import { z } from "zod";
import dotenv from "dotenv";

const envs = {
  ...process.env,
  ...dotenv.config().parsed,
  ...dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed
};

export const isProduction = process.env.NODE_ENV === "production";

export const { SOCKET_URI } = parseEnv(envs, {
  SOCKET_URI: z.string().url()
});
