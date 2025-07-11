import Elysia, { t } from "elysia";
import { openAPI } from "../index";

const app = new Elysia()

app.post("/object", ({ body }) => body, { 
    body: t.Object({
        string: t.String({ examples: ["String 1", "String 2"] }),
        number: t.Number({ examples: [20, 30] }),
        numeric: t.Numeric({ examples: [20, 30] }),
        boolean: t.Boolean({ examples: [true, false] }),
        literal: t.Literal("A"),
        union: t.Union([t.Literal("A"), t.Literal(4), t.Boolean()]),
        array: t.Array(t.String({ examples: ["String 1", "String 2"] })),
    }),
    detail: {
        tags: ["Request Body"]
    }
})

app.post("/array", ({ body }) => JSON.stringify(body), { 
    body: t.Array(t.String({ examples: ["String 1", "String 2"] })),
    detail: {
        tags: ["Request Body"]
    }
})

app.post("/array_of_objects", ({ body }) => body, { 
    body: t.Array(t.Object({
        string: t.String({ examples: ["String 1", "String 2"] }),
        number: t.Number({ examples: [20, 30] }),
        numeric: t.Numeric({ examples: [20, 30] }),
    })),
    detail: {
        tags: ["Request Body"]
    }
})

app.get("/params/:id", ({ params }) => params, { 
    params: t.Object({
        id: t.String({ examples: ["1", "2"] }),
    }),
    detail: {
        tags: ["Path Parameters"]
    }
})

app.get("/query", ({ query }) => query, { 
    query: t.Object({
        name: t.String({ examples: ["John", "Jane"] }),
    }),
    detail: {
        tags: ["Query Parameters"]
    }
})

app.get("/boolean_query", ({ query }) => query, { 
    query: t.Object({
        boolean: t.Boolean({ examples: [true, false] }),
    }),
    detail: {
        tags: ["Query Parameters"]
    }
})

app.get("/optional_boolean_query", ({ query }) => query, { 
    query: t.Object({
        boolean: t.Optional(t.Boolean({ examples: [true, false] })),
    }),
    detail: {
        tags: ["Query Parameters"]
    }
})

app.get("/true_or_undefined_query", ({ query }) => query, { 
    query: t.Object({
        pseudo_boolean: t.Optional(t.Literal("true")),
    }),
    detail: {
        tags: ["Query Parameters"]
    }
})

app.get("/object", () => {
    return {
        string: "string",
        boolean: true,
        literal: "A" as const,
    }
}, {
    response: t.Object({
        string: t.String({ examples: ["String 1", "String 2"] }),
        boolean: t.Boolean({ examples: [true, false] }),
        literal: t.Literal("A"),
    }),
    detail: {
        tags: ["Response Body"]
    }
})

app.use(openAPI({
    title: "Test API",
    version: "1.0.0",
    description: "Test API Documentation"
}))

app.listen(3000, () => {
    console.log(`Ready on http://localhost:${3000}/swagger`)
})