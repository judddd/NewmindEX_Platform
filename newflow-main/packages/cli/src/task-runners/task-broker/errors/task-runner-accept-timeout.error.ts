/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { OperationalError } from 'n8n-workflow';

export class TaskRunnerAcceptTimeoutError extends OperationalError {
	constructor(taskId: string, runnerId: string) {
		super(`Runner (${runnerId}) took too long to acknowledge acceptance of task (${taskId})`, {
			level: 'warning',
		});
	}
}
