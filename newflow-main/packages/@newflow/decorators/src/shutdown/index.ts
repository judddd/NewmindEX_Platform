/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export {
	HIGHEST_SHUTDOWN_PRIORITY,
	DEFAULT_SHUTDOWN_PRIORITY,
	LOWEST_SHUTDOWN_PRIORITY,
} from './constants';
export { ShutdownMetadata } from './shutdown-metadata';
export { OnShutdown } from './on-shutdown';
export type { ShutdownHandler, ShutdownServiceClass } from './types';
