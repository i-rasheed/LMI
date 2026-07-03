import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { PaystackWebhookPayload } from './subscriptions.types';

type RawBodyRequest = Request & { rawBody?: Buffer };

@ApiTags('webhooks')
@Controller('webhooks')
export class PaystackWebhookController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('paystack')
  @ApiOperation({ summary: 'Handle Paystack webhook events' })
  handlePaystack(
    @Headers('x-paystack-signature') signature: string | undefined,
    @Req() request: RawBodyRequest,
    @Body() body: PaystackWebhookPayload,
  ) {
    return this.subscriptionsService.handleWebhook(
      body,
      signature,
      request.rawBody,
    );
  }
}
