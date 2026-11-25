import type { OpenAPIObject, SchemaObject } from '@nestjs/swagger';
import { z } from 'zod';

const COMPONENT_PREFIX = '#/components/schemas/';

/** The `$ref` for a shared schema; each one names itself with `.meta({ id })`. */
export function zodComponentRef(schema: z.ZodType): string {
  const id = z.globalRegistry.get(schema)?.id;
  if (id === undefined) {
    throw new Error('A schema used in the API contract needs .meta({ id: "Name" })');
  }
  return `${COMPONENT_PREFIX}${id}`;
}

/** Adds every named shared Zod schema to the document as an OpenAPI component. */
export function withZodComponents(document: OpenAPIObject): OpenAPIObject {
  const { schemas } = z.toJSONSchema(z.globalRegistry, {
    target: 'openapi-3.0',
    uri: (id) => `${COMPONENT_PREFIX}${id}`,
  });
  const components = Object.fromEntries(
    // Zod emits the OpenAPI 3.0 dialect of JSON Schema; only its TypeScript type is wider.
    Object.entries(schemas).map(([id, { $id: _ownId, ...schema }]) => [id, schema as SchemaObject]),
  );
  return {
    ...document,
    components: {
      ...document.components,
      schemas: { ...document.components?.schemas, ...components },
    },
  };
}
