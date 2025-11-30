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
class CredentialsOverwrite {
	/**
	 * Prefilled data ("overwrite") in credential types. End users cannot view or change this data.
	 * Format: { CREDENTIAL_NAME: { PARAMETER: VALUE }}
	 */
	@Env('CREDENTIALS_OVERWRITE_DATA')
	data: string = '{}';

	/** Internal API endpoint to fetch overwritten credential types from. */
	@Env('CREDENTIALS_OVERWRITE_ENDPOINT')
	endpoint: string = '';
}

@Config
export class CredentialsConfig {
	/** Default name for credentials */
	@Env('CREDENTIALS_DEFAULT_NAME')
	defaultName: string = 'My credentials';

	@Nested
	overwrite: CredentialsOverwrite;

	// NewFlow: Auto-setup mode for appliance/offline deployments
	/** Enable automatic user creation and skip authentication */
	@Env('NEWFLOW_AUTO_SETUP_ENABLED')
	autoSetupEnabled: boolean = false;

	/** Email for auto-created owner user */
	@Env('NEWFLOW_AUTO_SETUP_EMAIL')
	autoSetupEmail: string = 'admin@localhost';

	/** Password for auto-created owner user */
	@Env('NEWFLOW_AUTO_SETUP_PASSWORD')
	autoSetupPassword: string = 'admin123';

	/** Predefined API key (JWT) for MCP tool integration */
	@Env('NEWFLOW_PREDEFINED_API_KEY')
	predefinedApiKey: string = '';
}
