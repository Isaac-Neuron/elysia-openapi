import Elysia, { t } from "elysia";
import { openAPI } from "../index";

const app = new Elysia()

app.post("/", ({ body }) => `Hello ${body.name}`, { 
    query: t.Object({
        name: t.String({ examples: ["John", "Jane"] }),
        age: t.Numeric({ examples: [20, 30] }),
        gender: t.UnionEnum(["male", "female", "other"])
    }),
    body: t.Object({
        name: t.String({ examples: ["John", "Jane"] }),
        age: t.Numeric({ examples: [20, 30] }),
        gender: t.UnionEnum(["male", "female", "other"])
    }),
    response: t.String() 
})

app.use(openAPI({
    title: "Test API",
    version: "1.0.0",
    description: "Test API Documentation"
}))

app.listen(3000, () => {
    console.log(`Ready on http://localhost:${3000}/swagger`)
})