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
export class PartialExecutionsConfig {
	/** Partial execution logic version to use by default. */
	@Env('NEWFLOW_PARTIAL_EXECUTION_VERSION_DEFAULT')
	version: 1 | 2 = 2;
}
