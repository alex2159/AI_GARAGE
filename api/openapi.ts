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
    "/api/v1/users/me/cars": {
      get: {
        tags: ["garage"],
        summary: "Список автомобилей текущего пользователя",
        operationId: "listCars",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Автомобили пользователя, сортировка по дате добавления",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Car" },
                },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
        },
      },
      post: {
        tags: ["garage"],
        summary: "Добавить автомобиль в гараж",
        operationId: "createCar",
        security: [{ sessionCookie: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CarInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Автомобиль создан",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Car" },
              },
            },
          },
          "400": {
            description: "Ошибка валидации (в т.ч. формат госномера)",
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
    "/api/v1/users/me/cars/{carId}": {
      parameters: [
        {
          name: "carId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["garage"],
        summary: "Карточка автомобиля",
        operationId: "getCar",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Автомобиль",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Car" },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
          "404": {
            description: "Автомобиль не найден (чужая запись неотличима от несуществующей)",
          },
        },
      },
      patch: {
        tags: ["garage"],
        summary: "Обновить автомобиль",
        operationId: "updateCar",
        security: [{ sessionCookie: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CarInput" },
            },
          },
        },
        responses: {
          "200": { description: "Автомобиль обновлён" },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
          "404": { description: "Автомобиль не найден" },
        },
      },
      delete: {
        tags: ["garage"],
        summary: "Удалить автомобиль из гаража",
        operationId: "deleteCar",
        security: [{ sessionCookie: [] }],
        responses: {
          "204": { description: "Автомобиль удалён" },
          "401": { description: "Требуется авторизация" },
          "404": { description: "Автомобиль не найден" },
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
      Car: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          brand: { type: "string", example: "ВАЗ" },
          model: { type: "string", example: "2101" },
          year: { type: "integer", example: 1975 },
          plateNumber: {
            type: "string",
            example: "А123БВ77",
            description: "Госномер РФ: кириллица, регион 2–3 цифры",
          },
          description: { type: "string", maxLength: 5000 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CarInput: {
        type: "object",
        required: ["brand", "model", "year", "plateNumber"],
        properties: {
          brand: { type: "string", maxLength: 120 },
          model: { type: "string", maxLength: 120 },
          year: { type: "integer", minimum: 1900 },
          plateNumber: { type: "string", example: "А123БВ77" },
          description: { type: "string", maxLength: 5000, default: "" },
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
