import { CorsOptions } from "cors";

import { LoggerFactory } from "../LoggerFactory";
import Route from "./Route";

type ApiVersionRouters = { version: string; routes: Route[] };

export default interface ConfigOptions {
  routes: ApiVersionRouters[];
  env?: "development" | "production" | "test";
  port?: number;

  logger: LoggerFactory["logger"];
  logFormat?: string;
  cors?: CorsOptions;
}
