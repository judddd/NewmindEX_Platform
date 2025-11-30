/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { AuthProviderType } from '@newflow/db';

/**
 * NewFlow Authentication Helpers
 *
 * SSO features (SAML/LDAP/OIDC) have been removed.
 * Only email/password authentication is supported.
 */

/**
 * Returns the current authentication method.
 * Always returns 'email' as SSO has been removed.
 */
export function getCurrentAuthenticationMethod(): AuthProviderType {
	return 'email';
}

/**
 * Checks if SAML is the current authentication method.
 * Always returns false as SAML has been removed.
 * @deprecated SSO features have been removed
 */
export function isSamlCurrentAuthenticationMethod(): boolean {
	return false;
}

/**
 * Checks if LDAP is the current authentication method.
 * Always returns false as LDAP has been removed.
 * @deprecated SSO features have been removed
 */
export function isLdapCurrentAuthenticationMethod(): boolean {
	return false;
}

/**
 * Checks if OIDC is the current authentication method.
 * Always returns false as OIDC has been removed.
 * @deprecated SSO features have been removed
 */
export function isOidcCurrentAuthenticationMethod(): boolean {
	return false;
}

/**
 * Checks if email is the current authentication method.
 * Always returns true as only email auth is supported.
 */
export function isEmailCurrentAuthenticationMethod(): boolean {
	return true;
}
