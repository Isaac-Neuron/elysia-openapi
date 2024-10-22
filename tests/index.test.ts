import { expect, test } from "bun:test";
import Elysia from "elysia";
import { oas, openAPI } from "../index";

const PORT = process.env.PORT || 3000

test("OpenAPI Plugin", async () => {
    const app = new Elysia()
    app.get("/", () => "Hello World")
    app.use(openAPI({
        title: "Test API",
        version: "1.0.0",
        description: "Test API Documentation"
    }))
    expect(oas.info.title).toBe("Test API")
    expect(oas.info.version).toBe("1.0.0")
    expect(oas.info.description).toBe("Test API Documentation")
    expect(oas.paths["/"]).toBeDefined()
    expect(app.router.history.find(h => h.path === "/spec.json")).toBeDefined()
    expect(app.router.history.find(h => h.path === "/swagger")).toBeDefined()
    expect(app.router.history.find(h => h.path === "/swagger.css")).toBeDefined()
    app.listen(PORT)
    const swaggerResponse = await fetch(`http://localhost:${PORT}/swagger`)
    expect(swaggerResponse.status).toBe(200)
    expect(swaggerResponse.headers.get("content-type")?.trim()).toBe("text/html;charset=utf-8")
});