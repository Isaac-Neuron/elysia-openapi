import Elysia, { t } from "elysia";
import { openAPI } from "../index";

const app = new Elysia()

app.post("/object-body-example", ({ body }) => JSON.stringify(body), { 
    body: t.Object({
        string: t.String({ examples: ["String 1", "String 2"] }),
        number: t.Number({ examples: [20, 30] }),
        numeric: t.Numeric({ examples: [20, 30] }),
        boolean: t.Boolean({ examples: [true, false] }),
        literal: t.Literal("A"),
        union: t.Union([t.Literal("A"), t.Literal(4), t.Boolean()]),
        array: t.Array(t.String({ examples: ["String 1", "String 2"] })),
    }),
})

app.use(openAPI({
    title: "Test API",
    version: "1.0.0",
    description: "Test API Documentation"
}))

app.listen(3000, () => {
    console.log(`Ready on http://localhost:${3000}/swagger`)
})