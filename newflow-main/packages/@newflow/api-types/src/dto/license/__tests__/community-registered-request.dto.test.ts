/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { CommunityRegisteredRequestDto } from '../community-registered-request.dto';

describe('CommunityRegisteredRequestDto', () => {
	it('should fail validation for missing email', () => {
		const invalidRequest = {};

		const result = CommunityRegisteredRequestDto.safeParse(invalidRequest);

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]).toEqual(
			expect.objectContaining({ message: 'Required', path: ['email'] }),
		);
	});

	it('should fail validation for an invalid email', () => {
		const invalidRequest = {
			email: 'invalid-email',
		};

		const result = CommunityRegisteredRequestDto.safeParse(invalidRequest);

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]).toEqual(
			expect.objectContaining({ message: 'Invalid email', path: ['email'] }),
		);
	});
});
