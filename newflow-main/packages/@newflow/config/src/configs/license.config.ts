/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env } from '../decorators';

@Config
export class LicenseConfig {
	/** License server URL to retrieve license. */
	@Env('NEWFLOW_LICENSE_SERVER_URL')
	serverUrl: string = 'https://license.newmindtech.cn/v1';

	/** Whether autorenewal for licenses is enabled. */
	@Env('NEWFLOW_LICENSE_AUTO_RENEW_ENABLED')
	autoRenewalEnabled: boolean = false;

	/** Activation key to initialize license. */
	@Env('NEWFLOW_LICENSE_ACTIVATION_KEY')
	activationKey: string = '';

	/** Whether floating entitlements should be returned to the pool on shutdown */
	@Env('NEWFLOW_LICENSE_DETACH_FLOATING_ON_SHUTDOWN')
	detachFloatingOnShutdown: boolean = true;

	/** Tenant ID used by the license manager SDK, e.g. for self-hosted, sandbox, embed, cloud. */
	@Env('NEWFLOW_LICENSE_TENANT_ID')
	tenantId: number = 1;

	/** Ephemeral license certificate. See: https://github.com/n8n-io/license-management?tab=readme-ov-file#concept-ephemeral-entitlements */
	@Env('NEWFLOW_LICENSE_CERT')
	cert: string = '';
}
