import { Module, type OnModuleInit } from '@nestjs/common';
import { RecordsModule } from '../records/records.module.js';
import { TypeCatalog } from '../records/type-catalog.js';
import { ASSETS_PACK } from './assets/assets-pack.js';

/** Every life-module pack built into this release. */
const BUILT_IN_PACKS = [ASSETS_PACK];

/**
 * Life modules (ADR 0006, ADR 0007): packs of Type definitions on the shared Records core,
 * not subsystems with storage of their own. Each pack plugs its Types into Records core.
 */
@Module({ imports: [RecordsModule] })
export class LifeModulesModule implements OnModuleInit {
  constructor(private readonly types: TypeCatalog) {}

  onModuleInit(): void {
    for (const pack of BUILT_IN_PACKS) this.types.registerBuiltIn(pack);
  }
}
