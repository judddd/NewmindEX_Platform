/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import { TaskRunnersConfig } from '@newflow/config';
import { Service } from '@newflow/di';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import * as process from 'node:process';

import { NodeProcessOomDetector } from './node-process-oom-detector';
import { TaskBrokerAuthService } from './task-broker/auth/task-broker-auth.service';
import { TaskRunnerLifecycleEvents } from './task-runner-lifecycle-events';
import { ChildProcess, ExitReason, TaskRunnerProcessBase } from './task-runner-process-base';

/**
 * Responsible for managing a JavaScript task runner as a child process.
 * This is for internal mode, which is NOT recommended for production.
 */
@Service()
export class JsTaskRunnerProcess extends TaskRunnerProcessBase {
	readonly name = 'runnner:js';

	readonly loggerScope = 'task-runner-js';

	private oomDetector: NodeProcessOomDetector | null = null;

	constructor(
		readonly logger: Logger,
		readonly runnerConfig: TaskRunnersConfig,
		readonly authService: TaskBrokerAuthService,
		readonly runnerLifecycleEvents: TaskRunnerLifecycleEvents,
	) {
		super(logger, runnerConfig, authService, runnerLifecycleEvents);

		assert(this.isInternal, `${this.constructor.name} cannot be used in external mode`);
	}

	async startProcess(grantToken: string, taskBrokerUri: string): Promise<ChildProcess> {
		const startScript = require.resolve('@newflow/task-runner/start');
		const flags = this.runnerConfig.insecureMode
			? []
			: ['--disallow-code-generation-from-strings', '--disable-proto=delete'];

		return spawn('node', [...flags, startScript], {
			env: this.getProcessEnvVars(grantToken, taskBrokerUri),
		});
	}

	setupProcessMonitoring(process: ChildProcess) {
		this.oomDetector = new NodeProcessOomDetector(process);
	}

	analyzeExitReason(): { reason: ExitReason } {
		return { reason: this.oomDetector?.didProcessOom ? 'oom' : 'unknown' };
	}

	private getProcessEnvVars(grantToken: string, taskBrokerUri: string) {
		const envVars: Record<string, string | undefined> = {
			// system environment
			PATH: process.env.PATH,
			HOME: process.env.HOME,
			NODE_PATH: process.env.NODE_PATH,

			// n8n
			GENERIC_TIMEZONE: process.env.GENERIC_TIMEZONE,
			NODE_FUNCTION_ALLOW_BUILTIN: process.env.NODE_FUNCTION_ALLOW_BUILTIN,
			NODE_FUNCTION_ALLOW_EXTERNAL: process.env.NODE_FUNCTION_ALLOW_EXTERNAL,

			// sentry
			NEWFLOW_SENTRY_DSN: process.env.NEWFLOW_SENTRY_DSN,
			NEWFLOW_VERSION: process.env.NEWFLOW_VERSION,
			ENVIRONMENT: process.env.ENVIRONMENT,
			DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME,

			// runner
			NEWFLOW_RUNNERS_GRANT_TOKEN: grantToken,
			NEWFLOW_RUNNERS_TASK_BROKER_URI: taskBrokerUri,
			NEWFLOW_RUNNERS_MAX_PAYLOAD: this.runnerConfig.maxPayload.toString(),
			NEWFLOW_RUNNERS_MAX_CONCURRENCY: this.runnerConfig.maxConcurrency.toString(),
			NEWFLOW_RUNNERS_TASK_TIMEOUT: this.runnerConfig.taskTimeout.toString(),
			NEWFLOW_RUNNERS_HEARTBEAT_INTERVAL: this.runnerConfig.heartbeatInterval.toString(),
			NEWFLOW_RUNNERS_INSECURE_MODE: process.env.NEWFLOW_RUNNERS_INSECURE_MODE,
		};

		if (this.runnerConfig.maxOldSpaceSize) {
			envVars.NODE_OPTIONS = `--max-old-space-size=${this.runnerConfig.maxOldSpaceSize}`;
		}

		return envVars;
	}
}
