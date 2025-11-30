/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ForgotPasswordRequestDto } from '../forgot-password-request.dto';

describe('ForgotPasswordRequestDto', () => {
	describe('Valid requests', () => {
		test.each([
			{
				name: 'valid email',
				request: { email: 'test@example.com' },
			},
			{
				name: 'email with subdomain',
				request: { email: 'user@sub.example.com' },
			},
		])('should validate $name', ({ request }) => {
			const result = ForgotPasswordRequestDto.safeParse(request);
			expect(result.success).toBe(true);
		});
	});

	describe('Invalid requests', () => {
		test.each([
			{
				name: 'invalid email format',
				request: { email: 'invalid-email' },
				expectedErrorPath: ['email'],
			},
			{
				name: 'missing email',
				request: {},
				expectedErrorPath: ['email'],
			},
			{
				name: 'empty email',
				request: { email: '' },
				expectedErrorPath: ['email'],
			},
		])('should fail validation for $name', ({ request, expectedErrorPath }) => {
			const result = ForgotPasswordRequestDto.safeParse(request);

			expect(result.success).toBe(false);

			if (expectedErrorPath) {
				expect(result.error?.issues[0].path).toEqual(expectedErrorPath);
			}
		});
	});
});
