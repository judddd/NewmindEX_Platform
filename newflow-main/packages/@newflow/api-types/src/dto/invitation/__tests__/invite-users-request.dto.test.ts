/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { InviteUsersRequestDto } from '../invite-users-request.dto';

describe('InviteUsersRequestDto', () => {
	describe('Valid requests', () => {
		test.each([
			{
				name: 'empty array',
				request: [],
			},
			{
				name: 'single user invitation with default role',
				request: [{ email: 'user@example.com' }],
			},
			{
				name: 'multiple user invitations with different roles',
				request: [
					{ email: 'user1@example.com', role: 'global:member' },
					{ email: 'user2@example.com', role: 'global:admin' },
					{ email: 'user3@example.com', role: 'custom:role' },
				],
			},
		])('should validate $name', ({ request }) => {
			const result = InviteUsersRequestDto.safeParse(request);
			expect(result.success).toBe(true);
		});

		it('should default role to global:member', () => {
			const result = InviteUsersRequestDto.safeParse([{ email: 'user@example.com' }]);
			expect(result.success).toBe(true);
			expect(result.data?.[0].role).toBe('global:member');
		});
	});

	describe('Invalid requests', () => {
		test.each([
			{
				name: 'invalid email',
				request: [{ email: 'invalid-email' }],
				expectedErrorPath: [0, 'email'],
			},
			{
				name: 'invalid role',
				request: [
					{
						email: 'user@example.com',
						role: 'global:owner',
					},
				],
				expectedErrorPath: [0, 'role'],
			},
		])('should fail validation for $name', ({ request, expectedErrorPath }) => {
			const result = InviteUsersRequestDto.safeParse(request);

			expect(result.success).toBe(false);

			if (expectedErrorPath) {
				expect(result.error?.issues[0].path).toEqual(expectedErrorPath);
			}
		});
	});
});
