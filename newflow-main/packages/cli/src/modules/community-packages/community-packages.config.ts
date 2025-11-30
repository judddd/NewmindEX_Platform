/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env } from '@newflow/config';

@Config
export class CommunityPackagesConfig {
	/** Whether to enable community packages */
	@Env('NEWFLOW_COMMUNITY_PACKAGES_ENABLED')
	enabled: boolean = false;

	/** NPM registry URL to pull community packages from */
	@Env('NEWFLOW_COMMUNITY_PACKAGES_REGISTRY')
	registry: string = 'https://registry.npmjs.org';

	/** Whether to reinstall any missing community packages */
	@Env('NEWFLOW_REINSTALL_MISSING_PACKAGES')
	reinstallMissing: boolean = false;

	/** Whether to block installation of not verified packages */
	@Env('NEWFLOW_UNVERIFIED_PACKAGES_ENABLED')
	unverifiedEnabled: boolean = true;

	/** Whether to enable and show search suggestion of packages verified by n8n */
	@Env('NEWFLOW_VERIFIED_PACKAGES_ENABLED')
	verifiedEnabled: boolean = false;

	/** Whether to load community packages */
	@Env('NEWFLOW_COMMUNITY_PACKAGES_PREVENT_LOADING')
	preventLoading: boolean = false;
}
