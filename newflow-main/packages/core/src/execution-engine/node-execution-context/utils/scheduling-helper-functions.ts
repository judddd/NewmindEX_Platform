/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';
import type { SchedulingFunctions, Workflow, CronContext, Cron } from 'n8n-workflow';

import { ScheduledTaskManager } from '../../scheduled-task-manager';

export const getSchedulingFunctions = (
	workflowId: Workflow['id'],
	timezone: Workflow['timezone'],
	nodeId: string,
): SchedulingFunctions => {
	const scheduledTaskManager = Container.get(ScheduledTaskManager);
	return {
		registerCron: ({ expression, recurrence }: Cron, onTick) => {
			const ctx: CronContext = {
				expression,
				recurrence,
				nodeId,
				workflowId,
				timezone,
			};

			return scheduledTaskManager.registerCron(ctx, onTick);
		},
	};
};
