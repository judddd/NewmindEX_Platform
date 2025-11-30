/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { isAuthProviderType } from '../types-db';

describe('types-db', () => {
	describe('isAuthProviderType', () => {
		it.each(['ldap', 'email', 'saml', 'oidc'])(
			'should return true for valid "%s" auth provider types',
			(provider) => {
				expect(isAuthProviderType(provider)).toBe(true);
			},
		);

		it.each([
			'google',
			'facebook',
			'github',
			'oauth2',
			'jwt',
			'basic',
			'',
			'LDAP', // case sensitive
			'OIDC',
			'Email',
		])('should return false for invalid "%s" auth provider types', (provider) => {
			expect(isAuthProviderType(provider)).toBe(false);
		});

		it.each([null, undefined, 123, true, false, {}, [], { type: 'oidc' }])(
			'should return false for non-string value "%s"',
			(value) => {
				expect(isAuthProviderType(value as string)).toBe(false);
			},
		);

		it('should handle edge cases', () => {
			expect(isAuthProviderType(' oidc ')).toBe(false); // whitespace
			expect(isAuthProviderType('oidc\n')).toBe(false); // newline
			expect(isAuthProviderType('oidc\t')).toBe(false); // tab
		});
	});
});
