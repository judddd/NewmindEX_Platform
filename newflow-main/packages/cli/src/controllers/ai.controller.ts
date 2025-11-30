/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { CreateCredentialDto } from '@newflow/api-types';
import {
	AiChatRequestDto,
	AiApplySuggestionRequestDto,
	AiAskRequestDto,
	AiFreeCreditsRequestDto,
} from '@newflow/api-types';
import { AuthenticatedRequest } from '@newflow/db';
import { Body, Post, RestController } from '@newflow/decorators';
// NewFlow: Replaced n8n AI SDK with CustomAI client
// import { type AiAssistantSDK, APIResponseError } from '@n8n_io/ai-assistant-sdk';
import { Response } from 'express';
import { OPEN_AI_API_CREDENTIAL_TYPE } from 'n8n-workflow';
import { strict as assert } from 'node:assert';
import { WritableStream } from 'node:stream/web';

import { FREE_AI_CREDITS_CREDENTIAL_NAME } from '@/constants';
import { CredentialsService } from '@/credentials/credentials.service';
import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { ContentTooLargeError } from '@/errors/response-errors/content-too-large.error';
import { InternalServerError } from '@/errors/response-errors/internal-server.error';
import { TooManyRequestsError } from '@/errors/response-errors/too-many-requests.error';
import { AiService } from '@/services/ai.service';
import { UserService } from '@/services/user.service';

export type FlushableResponse = Response & { flush: () => void };

// NewFlow: Custom types to replace AiAssistantSDK types
export interface ApplySuggestionResponse {
	sessionId: string;
	parameters: object;
}

export interface AskAiResponse {
	code: string;
}

export class APIResponseError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
	) {
		super(message);
		this.name = 'APIResponseError';
	}
}

@RestController('/ai')
export class AiController {
	constructor(
		private readonly aiService: AiService,
		private readonly credentialsService: CredentialsService,
		private readonly userService: UserService,
	) {}

	@Post('/chat', { rateLimit: { limit: 100 } })
	async chat(req: AuthenticatedRequest, res: FlushableResponse, @Body payload: AiChatRequestDto) {
		try {
			const aiResponse = await this.aiService.chat(payload, req.user);
			if (aiResponse.body) {
				res.header('Content-type', 'application/json-lines').flush();
				await aiResponse.body.pipeTo(
					new WritableStream({
						write(chunk) {
							res.write(chunk);
							res.flush();
						},
					}),
				);
				res.end();
			}
		} catch (e) {
			assert(e instanceof Error);
			throw new InternalServerError(e.message, e);
		}
	}

	@Post('/chat/apply-suggestion')
	async applySuggestion(
		req: AuthenticatedRequest,
		_: Response,
		@Body payload: AiApplySuggestionRequestDto,
	): Promise<ApplySuggestionResponse> {
		try {
			return await this.aiService.applySuggestion(payload, req.user);
		} catch (e) {
			assert(e instanceof Error);
			throw new InternalServerError(e.message, e);
		}
	}

	@Post('/ask-ai')
	async askAi(
		req: AuthenticatedRequest,
		_: Response,
		@Body payload: AiAskRequestDto,
	): Promise<AskAiResponse> {
		try {
			return await this.aiService.askAi(payload, req.user);
		} catch (e) {
			if (e instanceof APIResponseError) {
				switch (e.statusCode) {
					case 413:
						throw new ContentTooLargeError(e.message);
					case 429:
						throw new TooManyRequestsError(e.message);
					case 400:
						throw new BadRequestError(e.message);
					default:
						throw new InternalServerError(e.message, e);
				}
			}

			assert(e instanceof Error);
			throw new InternalServerError(e.message, e);
		}
	}

	@Post('/free-credits')
	async aiCredits(req: AuthenticatedRequest, _: Response, @Body payload: AiFreeCreditsRequestDto) {
		try {
			const aiCredits = await this.aiService.createFreeAiCredits(req.user);

			const credentialProperties: CreateCredentialDto = {
				name: FREE_AI_CREDITS_CREDENTIAL_NAME,
				type: OPEN_AI_API_CREDENTIAL_TYPE,
				data: {
					apiKey: aiCredits.apiKey,
					url: aiCredits.url,
				},
				projectId: payload?.projectId,
			};

			const newCredential = await this.credentialsService.createManagedCredential(
				credentialProperties,
				req.user,
			);

			await this.userService.updateSettings(req.user.id, {
				userClaimedAiCredits: true,
			});

			return newCredential;
		} catch (e) {
			assert(e instanceof Error);
			throw new InternalServerError(e.message, e);
		}
	}
}
