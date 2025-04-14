import express from "express";
import type { Request, Response, NextFunction } from "express";

import path from "path";
import httpProxy from 'http-proxy';

const BASE_DIR = path.resolve(__dirname, "..");
const gatewayConfigYaml = path.join(BASE_DIR, "conf", "gateway-config.yaml");

import { load } from "js-yaml";
import fs from "fs";
import cors from "cors";
import { GatewayConfig } from "./interfaces";

function loadConfig(): GatewayConfig | null {
  try {
    const fileContents = fs.readFileSync(gatewayConfigYaml, "utf8");
    return load(fileContents) as GatewayConfig;
  } catch (e) {
    console.log(e);
    return null;
  }
}

const globalLogger = (req: Request, res: Response, next: NextFunction) => {
    // [Timestamp] [Method] [URL]
    const timestamp = new Date().toISOString();
    const formattedTimestamp = timestamp.replace("T", " ").replace("Z", "");
    console.log(`${formattedTimestamp} | ${req.method} | ${req.url}`);
    next();
}

const app = express();
const PORT = process.env.PORT || 6001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://autoflow-ui.cfapps.us10-001.hana.ondemand.com",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(globalLogger);

const config = loadConfig();
if (!config) {
  console.error("Failed to load config");
  process.exit(1);
}

const routes = config.routes;

const proxy = httpProxy.createProxyServer();

routes.forEach((route) => {
    console.log(`Setting up proxy for ${route.path} to ${route.target}`);
    const handler = (req: Request, res: Response) => {
        const headers: any = {
            "X-Service-Name": route.serviceName
        }
    
        if (req.headers["authorization"]) {
            headers["Authorization"] = req.headers["authorization"];
        }
    
        req.url = path.posix.join(route.path, req.url || '/');

        console.log(`Proxying request to ${route.target}${req.url}`);
    
        proxy.web(req, res, {
            target: route.target,
            changeOrigin: true,
            secure: true,
            xfwd: true,
            headers,
            toProxy: true,
        })
    }
    
    app.use(route.path, handler);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
  return;
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
