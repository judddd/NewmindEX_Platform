/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Get, RestController } from '@newflow/decorators';
import { AuthenticatedRequest } from '@newflow/db';

import { ChatAgentsService } from './chat-agents.service';

@RestController('/chat-agents')
export class ChatAgentsController {
	constructor(private readonly chatAgentsService: ChatAgentsService) {}

	@Get('/')
	async getAll(req: AuthenticatedRequest) {
		return await this.chatAgentsService.findAllChatAgents();
	}
}
