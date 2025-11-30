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
export class WorkflowHistoryConfig {
	/** Whether to save workflow history versions. */
	@Env('NEWFLOW_WORKFLOW_HISTORY_ENABLED')
	enabled: boolean = true;

	/** Time (in hours) to keep workflow history versions for. `-1` means forever. */
	@Env('NEWFLOW_WORKFLOW_HISTORY_PRUNE_TIME')
	pruneTime: number = -1;
}
