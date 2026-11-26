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
    "/api/v1/events": {
      get: {
        tags: ["events"],
        summary: "Календарь событий",
        operationId: "listEvents",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "city",
            in: "query",
            required: false,
            description: "По умолчанию — город из профиля пользователя",
            schema: {
              type: "string",
              enum: ["MOSCOW", "SAINT_PETERSBURG", "KAZAN", "NIZHNY_NOVGOROD"],
            },
          },
          { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
          { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
          {
            name: "type",
            in: "query",
            required: false,
            schema: { $ref: "#/components/schemas/EventType" },
          },
          { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": {
            description: "События, сортировка по дате и времени начала",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventList" },
              },
            },
          },
          "400": {
            description: "Город не выбран ни в профиле, ни в параметре",
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
    "/api/v1/events/{eventId}": {
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["events"],
        summary: "Карточка события",
        operationId: "getEvent",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Событие",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Event" },
              },
            },
          },
          "401": { description: "Требуется авторизация" },
          "404": { description: "Событие не найдено" },
        },
      },
    },
    "/api/v1/events/types": {
      get: {
        tags: ["events"],
        summary: "Справочник типов событий",
        operationId: "listEventTypes",
        responses: {
          "200": {
            description: "Типы событий с русскими названиями",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { $ref: "#/components/schemas/EventType" },
                      name: { type: "string", example: "Выставка" },
                    },
                  },
                },
              },
            },
          },
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
      EventType: {
        type: "string",
        enum: ["MEETUP", "EXHIBITION", "RALLY", "FESTIVAL", "OTHER"],
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          externalId: { type: "string", example: "mock-moscow-0" },
          title: { type: "string", example: "Встреча клуба ретро-автомобилей" },
          eventDate: { type: "string", format: "date" },
          startTime: { type: "string", nullable: true, example: "10:00" },
          city: {
            type: "string",
            enum: ["MOSCOW", "SAINT_PETERSBURG", "KAZAN", "NIZHNY_NOVGOROD"],
          },
          type: { $ref: "#/components/schemas/EventType" },
          location: { type: "string", nullable: true, example: "ВДНХ, павильон «Транспорт»" },
          description: { type: "string", maxLength: 5000 },
        },
      },
      EventList: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Event" },
          },
          total: { type: "integer", example: 7 },
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 20 },
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
