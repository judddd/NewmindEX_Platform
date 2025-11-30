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
export class MultiMainSetupConfig {
	/** Whether to enable multi-main setup (if licensed) for scaling mode. */
	@Env('NEWFLOW_MULTI_MAIN_SETUP_ENABLED')
	enabled: boolean = false;

	/** Time to live (in seconds) for leader key in multi-main setup. */
	@Env('NEWFLOW_MULTI_MAIN_SETUP_KEY_TTL')
	ttl: number = 10;

	/** Interval (in seconds) for leader check in multi-main setup. */
	@Env('NEWFLOW_MULTI_MAIN_SETUP_CHECK_INTERVAL')
	interval: number = 3;
}
