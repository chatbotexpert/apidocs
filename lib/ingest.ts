import { prisma } from "./prisma";

// Minimal OpenAPI 3.x type shapes — no external dependency needed
type OASchema = {
    type?: string;
    properties?: Record<string, OASchema>;
    required?: string[];
    description?: string;
};
type OAParam = {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema?: OASchema;
};
type OAOperation = {
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: OAParam[];
    requestBody?: {
        content?: {
            "application/json"?: { schema?: OASchema };
        };
    };
};
type OASpec = {
    paths?: Record<string, Record<string, OAOperation | undefined> | undefined>;
};

const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "options", "head"];

export async function ingestOpenAPISpec(platformId: number, spec: OASpec) {
    const results = { created: 0, updated: 0, skipped: 0 };

    for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
        if (!pathItem) continue;

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!operation) continue;

            const summary = operation.summary ?? path;
            const description = operation.description ?? null;
            const category = operation.tags?.[0] ?? "General";
            const methodUpper = method.toUpperCase();

            // Upsert endpoint
            const endpoint = await prisma.endpoint.upsert({
                where: {
                    platformId_path_method: { platformId, path, method: methodUpper },
                },
                create: { platformId, path, method: methodUpper, summary, description, category },
                update: { summary, description, category },
            });

            // Upsert parameters
            const parameters: OAParam[] = (operation.parameters ?? []) as OAParam[];

            // Also handle request body fields
            const bodySchema = operation.requestBody?.content?.["application/json"]?.schema;
            if (bodySchema?.properties) {
                for (const [name, prop] of Object.entries(bodySchema.properties)) {
                    parameters.push({
                        name,
                        in: "body",
                        required: bodySchema.required?.includes(name) ?? false,
                        description: prop.description,
                        schema: prop,
                    });
                }
            }

            for (const param of parameters) {
                const type = param.schema?.type ?? "string";

                const existing = await prisma.parameter.findFirst({
                    where: { endpointId: endpoint.id, name: param.name },
                });

                if (existing) {
                    await prisma.parameter.update({
                        where: { id: existing.id },
                        data: {
                            type,
                            location: param.in,
                            isRequired: param.required ?? false,
                            description: param.description ?? null,
                            // NOTE: guide is NOT updated — preserves human-written content
                        },
                    });
                } else {
                    await prisma.parameter.create({
                        data: {
                            endpointId: endpoint.id,
                            name: param.name,
                            type,
                            location: param.in,
                            isRequired: param.required ?? false,
                            description: param.description ?? null,
                        },
                    });
                }
            }

            results.created++;
        }
    }

    return results;
}
