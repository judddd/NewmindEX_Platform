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
export class PushConfig {
	/** Backend to use for push notifications */
	@Env('NEWFLOW_PUSH_BACKEND')
	backend: 'sse' | 'websocket' = 'websocket';
}
