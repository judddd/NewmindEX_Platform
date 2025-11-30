/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { Config, Env } from '../decorators';

const releaseChannelSchema = z.enum(['stable', 'beta', 'nightly', 'dev']);
type ReleaseChannel = z.infer<typeof releaseChannelSchema>;

@Config
export class GenericConfig {
	/** Default timezone for the n8n instance. Can be overridden on a per-workflow basis. */
	@Env('GENERIC_TIMEZONE')
	timezone: string = 'America/New_York';

	@Env('NEWFLOW_RELEASE_TYPE', releaseChannelSchema)
	releaseChannel: ReleaseChannel = 'dev';

	/** Grace period (in seconds) to wait for components to shut down before process exit. */
	@Env('NEWFLOW_GRACEFUL_SHUTDOWN_TIMEOUT')
	gracefulShutdownTimeout: number = 30;
}
