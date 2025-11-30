/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	AiApplySuggestionRequestDto,
	AiAskRequestDto,
	AiChatRequestDto,
} from '@newflow/api-types';
import { GlobalConfig } from '@newflow/config';
import { Service } from '@newflow/di';
// NewFlow: Replaced n8n AI SDK with CustomAI client
// import { AiAssistantClient } from '@n8n_io/ai-assistant-sdk';
import { assert, type IUser } from 'n8n-workflow';

import { NEWFLOW_VERSION } from '../constants';
import { License } from '../license';
import { CustomAiClient } from './custom-ai-client';

@Service()
export class AiService {
	private client: CustomAiClient | undefined;

	constructor(
		private readonly licenseService: License,
		private readonly globalConfig: GlobalConfig,
	) {}

	async init() {
		// NewFlow: Simplified initialization - no license check needed
		const aiAssistantEnabled = this.licenseService.isAiAssistantEnabled();

		if (!aiAssistantEnabled) {
			return;
		}

		// NewFlow: CustomAI client initialization (no license cert or auth needed)
		const { Container } = await import('@newflow/di');
		const { Logger } = await import('@newflow/backend-common');

		this.client = new CustomAiClient(Container.get(Logger), this.globalConfig);
	}

	async chat(payload: AiChatRequestDto, user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.chat(payload, { id: user.id });
	}

	async applySuggestion(payload: AiApplySuggestionRequestDto, user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.applySuggestion(payload, { id: user.id });
	}

	async askAi(payload: AiAskRequestDto, user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.askAi(payload, { id: user.id });
	}

	async createFreeAiCredits(user: IUser) {
		if (!this.client) {
			await this.init();
		}
		assert(this.client, 'Assistant client not setup');

		return await this.client.generateAiCreditsCredentials(user);
	}
}
