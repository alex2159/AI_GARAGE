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
    "/api/v1/cities": {
      get: {
        tags: ["profile"],
        summary: "Справочник городов",
        operationId: "listCities",
        responses: {
          "200": {
            description: "Список городов MVP",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/City" },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["profile"],
        summary: "Профиль текущего пользователя",
        operationId: "getProfile",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Профиль",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Profile" },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
        },
      },
      patch: {
        tags: ["profile"],
        summary: "Обновление профиля (имя, город)",
        operationId: "updateProfile",
        security: [{ sessionCookie: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdate" },
            },
          },
        },
        responses: {
          "200": { description: "Профиль обновлён" },
          "400": {
            description: "Ошибка валидации (в т.ч. город вне справочника)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
        },
      },
    },
  },
  components: {
    schemas: {
      City: {
        type: "object",
        properties: {
          code: {
            type: "string",
            enum: ["MOSCOW", "SAINT_PETERSBURG", "KAZAN", "NIZHNY_NOVGOROD"],
          },
          name: { type: "string", example: "Москва" },
        },
      },
      Profile: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          displayName: { type: "string", example: "Alex" },
          email: { type: "string", example: "alex@example.com" },
          city: {
            type: "string",
            nullable: true,
            enum: ["MOSCOW", "SAINT_PETERSBURG", "KAZAN", "NIZHNY_NOVGOROD", null],
          },
        },
      },
      ProfileUpdate: {
        type: "object",
        properties: {
          displayName: { type: "string", maxLength: 255 },
          city: {
            type: "string",
            nullable: true,
            enum: ["MOSCOW", "SAINT_PETERSBURG", "KAZAN", "NIZHNY_NOVGOROD", null],
          },
        },
      },
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
