// OpenAPI 3.0 specification for the AI Garage API (MVP).
// Served at /api/v1/openapi.json; rendered at /swagger-ui.

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "AI Garage API",
    version: "0.1.0",
    description:
      "MVP платформы для владельцев ретро-автомобилей: личный кабинет (город, гараж) и календарь событий в городе пользователя.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "system", description: "Служебные эндпоинты" },
    { name: "profile", description: "Личный кабинет" },
    { name: "garage", description: "Автомобили пользователя" },
    { name: "events", description: "Календарь событий" },
  ],
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["system"],
        summary: "Проверка состояния сервиса",
        operationId: "getHealth",
        responses: {
          "200": { description: "Сервис работает" },
          "503": { description: "Сервис деградировал (БД недоступна)" },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          fields: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    },
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "kimi_sid",
      },
    },
  },
} as const;
