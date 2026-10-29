import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          const route = parsedUrl.pathname.replace(/^\/api\//, "").split("/")[0];

          let handlerModule: any;
          try {
            handlerModule = await server.ssrLoadModule(`/api/${route}.ts`);
          } catch {
            return next();
          }

          const handler = handlerModule.default || handlerModule;
          if (typeof handler !== "function") return next();

          // Enhance req with query & body
          const query: Record<string, string> = {};
          parsedUrl.searchParams.forEach((val, key) => {
            query[key] = val;
          });
          (req as any).query = query;

          // Parse body if present
          let bodyStr = "";
          req.on("data", (chunk: any) => {
            bodyStr += chunk;
          });
          req.on("end", async () => {
            if (bodyStr) {
              try {
                (req as any).body = JSON.parse(bodyStr);
              } catch {
                (req as any).body = bodyStr;
              }
            } else {
              (req as any).body = {};
            }

            // Enhance res
            (res as any).status = function (code: number) {
              res.statusCode = code;
              return res;
            };
            (res as any).json = function (data: any) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
              return res;
            };

            try {
              await handler(req, res);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || "Internal server error",
                })
              );
            }
          });
        } catch {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevMiddleware()],
});
