/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IRestApiContext } from '@newflow/rest-api-client';
import { makeRestApiRequest } from '@newflow/rest-api-client';

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

export async function getChatAgents(context: IRestApiContext): Promise<ChatAgent[]> {
	return await makeRestApiRequest(context, 'GET', '/chat-agents');
}
