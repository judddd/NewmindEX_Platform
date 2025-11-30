/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import { WebhookRepository, WorkflowRepository } from '@newflow/db';

export interface ChatAgent {
	id: string;
	name: string;
	description?: string;
	webhookId: string;
	webhookPath: string;
	webhookUrl: string;
	isActive: boolean;
	nodeName: string;
}

@Service()
export class ChatAgentsService {
	constructor(
		private readonly webhookRepository: WebhookRepository,
		private readonly workflowRepository: WorkflowRepository,
	) {}

	async findAllChatAgents(): Promise<ChatAgent[]> {
		// Query webhooks where webhookPath ends with '/chat'
		const webhooks = await this.webhookRepository
			.createQueryBuilder('webhook')
			.innerJoin('workflow_entity', 'workflow', 'workflow.id = webhook.workflowId')
			.where('webhook.webhookPath LIKE :path', { path: '%/chat' })
			.andWhere('webhook.method = :method', { method: 'POST' })
			.select([
				'workflow.id as workflowId',
				'workflow.name as name',
				'workflow.active as isActive',
				'webhook.webhookId as webhookId',
				'webhook.webhookPath as webhookPath',
				'webhook.node as nodeName',
			])
			.getRawMany();

		return webhooks.map((wh) => {
			// Extract webhook ID from webhookPath (format: "uuid/chat")
			// The webhookId column is often null, so we need to parse it from the path
			const pathParts = wh.webhookPath.split('/');
			const extractedWebhookId =
				pathParts.length > 1 ? pathParts[0] : wh.webhookId || wh.workflowId;

			return {
				id: wh.workflowId,
				name: wh.name,
				webhookId: extractedWebhookId,
				webhookPath: wh.webhookPath,
				webhookUrl: `/webhook/${wh.webhookPath}`,
				isActive: !!wh.isActive,
				nodeName: wh.nodeName,
			};
		});
	}
}
