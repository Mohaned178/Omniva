import { Controller, Get, HttpCode, HttpStatus, Module, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RequiresRole } from '../../../src/identity/requires-role.decorator.js';

/** Where the probe endpoints live, under the API's /v1 prefix. */
export const GATE_PROBE_PATH = '/v1/gate-probe/workspaces/{workspaceId}';

/**
 * Stand-ins for the endpoints later tickets add inside a workspace, so the gate's role check
 * and its fail-closed default are tested now. Mounted only in the test harness and left out
 * of the API's OpenAPI document.
 */
@ApiExcludeController()
@Controller('gate-probe/workspaces/:workspaceId')
class GateProbeController {
  @Post('editor-action')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresRole('editor')
  editorAction(): void {
    // Reaching here is the outcome under test.
  }

  @Post('owner-action')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresRole('owner')
  ownerAction(): void {
    // Reaching here is the outcome under test.
  }

  /** Names a workspace but forgets to declare a role. */
  @Get('ungated')
  ungated(): void {
    // Must never be reached.
  }
}

@Module({ controllers: [GateProbeController] })
export class GateProbeModule {}
