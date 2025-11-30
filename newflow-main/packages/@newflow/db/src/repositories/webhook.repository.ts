/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import { DataSource, IsNull, Repository } from '@n8n/typeorm';

import { WebhookEntity } from '../entities';

@Service()
export class WebhookRepository extends Repository<WebhookEntity> {
	constructor(dataSource: DataSource) {
		super(WebhookEntity, dataSource.manager);
	}

	/**
	 * Retrieve all webhooks whose paths only have static segments, e.g. `{uuid}` or `user/profile`.
	 * This excludes webhooks having paths with dynamic segments, e.g. `{uuid}/user/:id/posts`.
	 */
	async getStaticWebhooks() {
		return await this.findBy({ webhookId: IsNull() });
	}
}
