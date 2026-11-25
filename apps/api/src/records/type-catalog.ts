import { Injectable } from '@nestjs/common';
import { TypeDefinitionSchema, type TypeDefinition } from '@omniva/schemas';

/**
 * Every Type records can be created from (ADR 0007). Life-module packs register their
 * built-in Types here at start-up, so a new Type is a new definition in its pack and Records
 * core never changes for it (CODING_STANDARDS §3, open/closed).
 */
@Injectable()
export class TypeCatalog {
  private readonly builtIn = new Map<string, TypeDefinition>();

  /** Adds a pack's built-in Types; a definition that breaks the shared shape stops start-up. */
  registerBuiltIn(definitions: readonly TypeDefinition[]): void {
    for (const definition of definitions) {
      const valid = TypeDefinitionSchema.parse(definition);
      if (this.builtIn.has(valid.key)) {
        throw new Error(`Two built-in Types are called ${valid.key}`);
      }
      this.builtIn.set(valid.key, valid);
    }
  }

  find(typeKey: string): TypeDefinition | undefined {
    return this.builtIn.get(typeKey);
  }

  all(): readonly TypeDefinition[] {
    return [...this.builtIn.values()];
  }
}
