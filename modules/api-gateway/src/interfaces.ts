export interface CorsConfig {
  allowedOrigins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

export interface RouteConfig {
  path: string;
  target: string;
  serviceName: string;
}

export interface GatewayConfig {
  name: string;
  version: string;
  cors: CorsConfig;
  routes: RouteConfig[];
}
