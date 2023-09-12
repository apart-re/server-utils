import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, json, urlencoded } from "express";
import expressListRoutes from "express-list-routes";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import { ConfigOptions } from "./interfaces";

abstract class AppFactory {
  public app: Application;

  private env: string;

  private port: string | number;

  private logger: ConfigOptions["logger"];

  constructor(config: ConfigOptions) {
    this.app = express();
    this.env = config.env ?? "development";
    this.port = config.port ?? 3000;
    this.logger = config.logger;

    this.initializeConnections()
      .then(() => {
        this.logger.info("Connections initialized");
      })
      .catch((err) => {
        this.logger.error("An Error has occurred during connection init");
        throw err;
      });
    this.initializeExpressMiddlewares({
      logFormat: config.logFormat,
      cors: config.cors,
    });
    this.initializeRoutes(config.routes);
    this.initializeErrorHandling();
  }

  private initializeExpressMiddlewares({
    logFormat,
    cors: corsOptions,
  }: Pick<ConfigOptions, "logFormat" | "cors">) {
    this.logger.info("Loading default middlewares...");
    this.app.use(
      morgan(logFormat ?? "dev", {
        stream: {
          write: (message) =>
            this.logger.info(message.substring(0, message.lastIndexOf("\n"))),
        },
      }),
    );

    this.app.use(cors(corsOptions ?? { origin: "*", credentials: false }));

    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));

    this.app.use(cookieParser());
    this.logger.info("Default middlewares loaded");
  }

  private initializeRoutes(apiRoutes: ConfigOptions["routes"]): void {
    this.logger.info("Loading routes...");
    this.app.use("/health", (_req, res) => res.status(200).send("Ok"));
    apiRoutes.forEach(({ version, routes }) => {
      this.app.use(
        version,
        routes.map(({ router }) => router),
      );
    });

    expressListRoutes(this.app);
    this.logger.info("Routes loaded");
  }

  protected abstract initializeConnections(): Promise<void>;

  protected abstract initializeErrorHandling(): void;

  public listen() {
    this.app.listen(this.port, () => {
      console.info(`======= ENV: ${this.env} =======`);
      console.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }
}

export default AppFactory;
