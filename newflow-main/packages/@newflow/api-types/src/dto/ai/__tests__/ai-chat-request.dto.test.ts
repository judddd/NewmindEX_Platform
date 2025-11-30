/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { AiChatRequestDto } from '../ai-chat-request.dto';

describe('AiChatRequestDto', () => {
	it('should validate a request with a payload and session ID', () => {
		const validRequest = {
			payload: { someKey: 'someValue' },
			sessionId: 'session-123',
		};

		const result = AiChatRequestDto.safeParse(validRequest);

		expect(result.success).toBe(true);
	});

	it('should validate a request with only a payload', () => {
		const validRequest = {
			payload: { complexObject: { nested: 'value' } },
		};

		const result = AiChatRequestDto.safeParse(validRequest);

		expect(result.success).toBe(true);
	});

	it('should fail if payload is missing', () => {
		const invalidRequest = {
			sessionId: 'session-123',
		};

		const result = AiChatRequestDto.safeParse(invalidRequest);

		expect(result.success).toBe(false);
	});
});
