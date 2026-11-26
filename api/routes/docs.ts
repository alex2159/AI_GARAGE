import { Hono } from "hono";
import { openApiDocument } from "../openapi";

// Mounted at "/" — paths below are absolute.
export const docsRoutes = new Hono();

// GET /api/v1/openapi.json — machine-readable API contract.
docsRoutes.get("/api/v1/openapi.json", (c) => c.json(openApiDocument));

const swaggerHtml = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Garage API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api/v1/openapi.json",
        dom_id: "#swagger-ui",
      });
    </script>
  </body>
</html>`;

// GET /swagger-ui — human-readable API docs (swagger-ui from CDN).
docsRoutes.get("/swagger-ui", (c) => c.html(swaggerHtml));
