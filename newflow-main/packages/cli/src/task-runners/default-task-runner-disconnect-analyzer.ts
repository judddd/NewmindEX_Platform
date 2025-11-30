/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { GlobalConfig } from '@newflow/config';
import { Container, Service } from '@newflow/di';

import type {
	DisconnectAnalyzer,
	DisconnectErrorOptions,
} from '@/task-runners/task-broker/task-broker-types';

import { TaskRunnerDisconnectedError } from './errors/task-runner-disconnected-error';
import { TaskRunnerFailedHeartbeatError } from './errors/task-runner-failed-heartbeat.error';

/**
 * Analyzes the disconnect reason of a task runner to provide a more
 * meaningful error message to the user.
 */
@Service()
export class DefaultTaskRunnerDisconnectAnalyzer implements DisconnectAnalyzer {
	get isCloudDeployment() {
		return Container.get(GlobalConfig).deployment.type === 'cloud';
	}

	async toDisconnectError(opts: DisconnectErrorOptions): Promise<Error> {
		const { reason, heartbeatInterval } = opts;

		if (reason === 'failed-heartbeat-check' && heartbeatInterval) {
			return new TaskRunnerFailedHeartbeatError(
				heartbeatInterval,
				Container.get(GlobalConfig).deployment.type !== 'cloud',
			);
		}

		return new TaskRunnerDisconnectedError(
			opts.runnerId ?? 'Unknown runner ID',
			this.isCloudDeployment,
		);
	}
}
