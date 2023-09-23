import { describe, expect, it, vi } from "vitest";

import AppFactory from "../AppFactory";
import { ConfigOptions } from "../interfaces";

class MockAppFactory extends AppFactory {
  protected async initializeConnections(): Promise<void> {}
  protected initializeErrorHandling(): void {}
}

describe("AppFactory", () => {
  const mockLogger = {
    info: (message: string) => message,
    error: (message: string) => message,
  };

  const config = {
    env: "test" as ConfigOptions["env"],
    port: 3000,
    logger: mockLogger as unknown as ConfigOptions["logger"],
    logFormat: "dev",
    cors: { origin: "*", credentials: false },
    routes: [],
  };

  const appFactory = new MockAppFactory(config);

  it("initializeExpressMiddlewares", () => {
    const infoSpy = vi.spyOn(mockLogger, "info");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    appFactory.initializeExpressMiddlewares({
      logFormat: config.logFormat,
      cors: config.cors,
    });

    expect(infoSpy.mock.calls.length).toBe(2);
    expect(infoSpy.mock.calls[0][0]).toBe("Loading default middlewares...");
    expect(infoSpy.mock.calls[1][0]).toBe("Default middlewares loaded");

    infoSpy.mockRestore();
  });
  it("initializeRoutes", () => {
    const infoSpy = vi.spyOn(mockLogger, "info");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    appFactory.initializeRoutes(config.routes);

    expect(infoSpy.mock.calls.length).toBe(2);
    expect(infoSpy.mock.calls[0][0]).toBe("Loading routes...");
    expect(infoSpy.mock.calls[1][0]).toBe("Routes loaded");

    infoSpy.mockRestore();
  });
});
