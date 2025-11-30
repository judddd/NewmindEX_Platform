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
export class SentryConfig {
	/** Sentry DSN (data source name) */
	@Env('NEWFLOW_SENTRY_DSN')
	dsn: string = '';

	//#region Metadata about the environment

	@Env('NEWFLOW_VERSION')
	n8nVersion: string = '';

	@Env('ENVIRONMENT')
	environment: string = '';

	@Env('DEPLOYMENT_NAME')
	deploymentName: string = '';

	//#endregion
}
