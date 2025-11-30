/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Replaced n8n AI SDK with CustomAI client
// import type { AiAssistantSDK } from '@n8n_io/ai-assistant-sdk';
import { z } from 'zod';
import { Z } from 'zod-class';

// NewFlow: Define our own interface instead of relying on SDK
export interface ChatRequestPayload {
	payload: object;
	sessionId?: string;
}

export class AiChatRequestDto
	extends Z.class({
		payload: z.object({}).passthrough(), // Allow any object shape
		sessionId: z.string().optional(),
	})
	implements ChatRequestPayload {}
