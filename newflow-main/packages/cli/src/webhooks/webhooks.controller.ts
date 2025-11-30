/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Post, RestController } from '@newflow/decorators';
import { Request } from 'express';
import get from 'lodash/get';

import { WebhookService } from './webhook.service';
import type { Method } from './webhook.types';

@RestController('/webhooks')
export class WebhooksController {
	constructor(private readonly webhookService: WebhookService) {}

	@Post('/find')
	async findWebhook(req: Request) {
		const body = get(req, 'body', {}) as { path: string; method: Method };

		try {
			const webhook = await this.webhookService.findWebhook(body.method, body.path);
			return webhook;
		} catch (error) {
			return null;
		}
	}
}
