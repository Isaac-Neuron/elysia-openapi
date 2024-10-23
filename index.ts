import Elysia from "elysia";
import path from "path";

export const oas: any = {
    "openapi": "3.1.0",
    "components": {
        "securitySchemes": {
            "Cookie": {
                "type": "apiKey",
                "in": "cookie",
                "name": "accessToken"
            },
            "Bearer": {
                "type": "apiKey",
                "scheme": "bearer",
                "name": "Authorization",
                "in": "header"
            }
        }
    },
    "security": [
        {
            "Bearer": []
        }
    ],
    "info": {},
    "paths": {}
}

export function objectToRequestBodyProperties(obj: any) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                obj[key] = {
                    type: "object",
                    properties: obj[key]
                }
                objectToRequestBodyProperties(value);
            }
            else {
                obj[key] = {
                    type: typeof value,
                    example: value
                }
            }
        }
    }
}

function changePathFormat(path: string): string {
    return path.replace(/:(\w+)/g, '{$1}');
}

type OpenAPIOptions = {
    title?: string
    version?: string
    description?: string
}

export const openAPI = (options: OpenAPIOptions) => (elysia: Elysia) => {
    oas.info = {
        title: options.title || "Elysia API",
        version: options.version || "1.0.0",
        description: options.description || "Elysia API Documentation"
    }

    for (const history of elysia.router.history) {
        let path = history.path
        const method = history.method.toLowerCase()
        const { body, query, response, details } = history.hooks
        path = changePathFormat(path)
        
        if (!oas.paths[path]) oas.paths[path] = {}
        if (!oas.paths[path][method]) oas.paths[path][method] = {}
        if (details?.tags) oas.paths[path][method].tags = details.tags
        if (body) {
            let properties = { ...body.properties }
            let requestBodyContentType = "application/json"
            Object.entries(body.properties).forEach(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                    const propertieObject = value as any
                    if (propertieObject.format === "binary") {
                        properties[key] = {
                            type: "string",
                            format: "binary"
                        }
                        requestBodyContentType = "multipart/form-data"
                    }
                    else if (propertieObject.elysiaMeta === "Files") {
                        properties[key] = {
                            type: "array",
                            items: {
                                type: "string",
                                format: "binary"
                            }
                        }
                        requestBodyContentType = "multipart/form-data"
                    }
                }
            })
            switch (body.type) {
                case "object":
                    oas.paths[path][method].requestBody = {
                        content: {
                            [requestBodyContentType]: {
                                schema: {
                                    type: "object",
                                    properties: properties
                                }
                            }
                        },
                        required: true
                    }
                    break
                case "string":
                    oas.paths[path][method].requestBody = {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "string",
                                    example: body.example
                                }
                            }
                        },
                        required: true
                    }
                    break
            }
        }
        oas.paths[path][method].parameters = []
        if (query) {
            if (query.type === "object" && query.properties) {
                for (const [paramKey, object] of Object.entries(query.properties)) {
                    if (typeof object === "object" && object !== null) {
                        const paramObject = object as any
                        const optionalSymbol = Object.getOwnPropertySymbols(paramObject).find(sym => sym.toString() === 'Symbol(TypeBox.Optional)');
                        oas.paths[path][method].parameters.push({
                            name: paramKey,
                            in: "query",
                            require: !optionalSymbol || paramObject[optionalSymbol] !== "Optional",
                            example: paramObject.examples ? paramObject.examples[Math.floor(Math.random() * paramObject.examples.length)] : undefined,
                            schema: {
                                type: paramObject.type,
                            }
                        })
                    }
                }
            }
        }
        const pathParams = path.match(/\{(\w+)\}/g)
        if (pathParams) for (const param of pathParams) {
            oas.paths[path][method].parameters.push({
                name: param.slice(1, -1),
                in: "path",
                require: true
            })
        }
        oas.paths[path][method].responses = {}
        if (response) {
            switch (response.type) {
                case "object":
                    oas.paths[path][method].responses[200] = {
                        description: `Returns a JSON object`,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: response.properties
                                }
                            }
                        }
                    }
                    break
            }
        }
    }

    const __dirname = import.meta.dir;
    const assets = path.join(__dirname, "assets");

    elysia.get("/spec.json", () => oas)
    elysia.get("/swagger", () => Bun.file(path.join(assets, "swagger.html")));
    elysia.get("/swagger.css", () => Bun.file(path.join(assets, "swagger.css")));

    return elysia
}