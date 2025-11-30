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
class PostHogConfig {
	/** API key for PostHog. */
	@Env('NEWFLOW_DIAGNOSTICS_POSTHOG_API_KEY')
	apiKey: string = 'phc_4URIAm1uYfJO7j8kWSe0J8lc8IqnstRLS7Jx8NcakHo';

	/** API host for PostHog. */
	@Env('NEWFLOW_DIAGNOSTICS_POSTHOG_API_HOST')
	apiHost: string = 'https://ph.newmindtech.cn';
}

@Config
export class DiagnosticsConfig {
	/** Whether diagnostics are enabled. */
	@Env('NEWFLOW_DIAGNOSTICS_ENABLED')
	enabled: boolean = false;

	/** Diagnostics config for frontend. */
	@Env('NEWFLOW_DIAGNOSTICS_CONFIG_FRONTEND')
	frontendConfig: string = '1zPn9bgWPzlQc0p8Gj1uiK6DOTn;https://telemetry.newmindtech.cn';

	/** Diagnostics config for backend. */
	@Env('NEWFLOW_DIAGNOSTICS_CONFIG_BACKEND')
	backendConfig: string = '1zPn7YoGC3ZXE9zLeTKLuQCB4F6;https://telemetry.newmindtech.cn';

	@Nested
	posthogConfig: PostHogConfig;
}
