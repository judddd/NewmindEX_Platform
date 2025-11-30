/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { GlobalConfig } from '@newflow/config';
import { Container } from '@newflow/di';

// Simplified: only check config, no license check
export function isWorkflowHistoryEnabled() {
	return Container.get(GlobalConfig).workflowHistory.enabled;
}

// Simplified: only read config prune time (no license limitation)
// Time in hours
export function getWorkflowHistoryPruneTime(): number {
	return Container.get(GlobalConfig).workflowHistory.pruneTime;
}
