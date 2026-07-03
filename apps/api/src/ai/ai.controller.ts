import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  aiDigestSchema,
  aiExplainOutlierSchema,
  aiModerateSchema,
  aiSearchSchema,
} from '@lmi/shared';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { ActiveAccountGuard } from '../common/guards/active-account.guard';
import { AdminRoleGuard } from '../common/guards/admin-role.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { AiService } from './ai.service';

class AiSearchDto extends createZodDto(aiSearchSchema) {}
class AiExplainOutlierDto extends createZodDto(aiExplainOutlierSchema) {}
class AiModerateDto extends createZodDto(aiModerateSchema) {}
class AiDigestDto extends createZodDto(aiDigestSchema) {}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(AuthGuard, ActiveAccountGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('search')
  @ApiOperation({ summary: 'AI-assisted search suggestions' })
  search(@Body(new ZodValidationPipe(aiSearchSchema)) body: AiSearchDto) {
    return this.aiService.search(body);
  }

  @Post('explain-outlier')
  @ApiOperation({ summary: 'Explain unusual price submissions' })
  explainOutlier(
    @Body(new ZodValidationPipe(aiExplainOutlierSchema))
    body: AiExplainOutlierDto,
  ) {
    return this.aiService.explainOutlier(body);
  }

  @Post('moderate')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Summarise flagged price moderation context' })
  moderate(@Body(new ZodValidationPipe(aiModerateSchema)) body: AiModerateDto) {
    return this.aiService.moderate(body);
  }

  @Post('digest')
  @ApiOperation({ summary: 'Generate a premium shopping digest' })
  digest(@Body(new ZodValidationPipe(aiDigestSchema)) body: AiDigestDto) {
    return this.aiService.digest(body);
  }
}
