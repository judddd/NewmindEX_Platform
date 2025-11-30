/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env } from '../decorators';

@Config
export class AiAssistantConfig {
	/** Base URL of the AI assistant service */
	@Env('NEWFLOW_AI_ASSISTANT_BASE_URL')
	baseUrl: string = '';

	/** NewFlow: CustomAI configuration */

	/** CustomAI Base URL - OpenAI-compatible API endpoint */
	@Env('CUSTOM_AI_BASE_URL')
	customAiBaseUrl: string = '';

	/** CustomAI API Key */
	@Env('CUSTOM_AI_API_KEY')
	apiKey: string = '';

	/** CustomAI Model Name */
	@Env('CUSTOM_AI_MODEL')
	model: string = 'gpt-3.5-turbo';
}
