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
export class SentryConfig {
	/** Sentry DSN (data source name) for the backend. */
	@Env('NEWFLOW_SENTRY_DSN')
	backendDsn: string = '';

	/** Sentry DSN (data source name) for the frontend. */
	@Env('NEWFLOW_FRONTEND_SENTRY_DSN')
	frontendDsn: string = '';

	/**
	 * Environment of the n8n instance.
	 *
	 * @example 'production'
	 */
	@Env('ENVIRONMENT')
	environment: string = '';

	/**
	 * Name of the deployment, e.g. cloud account name.
	 *
	 * @example 'janober'
	 */
	@Env('DEPLOYMENT_NAME')
	deploymentName: string = '';
}
