/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env, Nested } from '../decorators';

@Config
class SamlConfig {
	/** Whether to enable SAML SSO. */
	@Env('NEWFLOW_SSO_SAML_LOGIN_ENABLED')
	loginEnabled: boolean = false;

	@Env('NEWFLOW_SSO_SAML_LOGIN_LABEL')
	loginLabel: string = '';
}

@Config
class OidcConfig {
	/** Whether to enable OIDC SSO. */
	@Env('NEWFLOW_SSO_OIDC_LOGIN_ENABLED')
	loginEnabled: boolean = false;
}

@Config
class LdapConfig {
	/** Whether to enable LDAP SSO. */
	@Env('NEWFLOW_SSO_LDAP_LOGIN_ENABLED')
	loginEnabled: boolean = false;

	@Env('NEWFLOW_SSO_LDAP_LOGIN_LABEL')
	loginLabel: string = '';
}

@Config
export class SsoConfig {
	/** Whether to create users when they log in via SSO. */
	@Env('NEWFLOW_SSO_JUST_IN_TIME_PROVISIONING')
	justInTimeProvisioning: boolean = true;

	/** Whether to redirect users from the login dialog to initialize SSO flow. */
	@Env('NEWFLOW_SSO_REDIRECT_LOGIN_TO_SSO')
	redirectLoginToSso: boolean = true;

	@Nested
	saml: SamlConfig;

	@Nested
	oidc: OidcConfig;

	@Nested
	ldap: LdapConfig;
}
