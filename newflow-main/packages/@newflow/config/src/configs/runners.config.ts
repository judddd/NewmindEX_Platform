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

const runnerModeSchema = z.enum(['internal', 'external']);

export type TaskRunnerMode = z.infer<typeof runnerModeSchema>;

@Config
export class TaskRunnersConfig {
	@Env('NEWFLOW_RUNNERS_ENABLED')
	enabled: boolean = false;

	/**
	 * Whether the task runner should run as a child process spawned by NewFlow (internal mode)
	 * or as a separate process launched outside NewFlow (external mode).
	 */
	@Env('NEWFLOW_RUNNERS_MODE', runnerModeSchema)
	mode: TaskRunnerMode = 'internal';

	/** Endpoint which task runners connect to */
	@Env('NEWFLOW_RUNNERS_PATH')
	path: string = '/runners';

	@Env('NEWFLOW_RUNNERS_AUTH_TOKEN')
	authToken: string = '';

	/** IP address task runners broker should listen on */
	@Env('NEWFLOW_RUNNERS_BROKER_PORT')
	port: number = 5679;

	/** IP address task runners broker should listen on */
	@Env('NEWFLOW_RUNNERS_BROKER_LISTEN_ADDRESS')
	listenAddress: string = '127.0.0.1';

	/** Maximum size of a payload sent to the runner in bytes, Default 1G */
	@Env('NEWFLOW_RUNNERS_MAX_PAYLOAD')
	maxPayload: number = 1024 * 1024 * 1024;

	/** The --max-old-space-size option to use for the runner (in MB). Default means node.js will determine it based on the available memory. */
	@Env('NEWFLOW_RUNNERS_MAX_OLD_SPACE_SIZE')
	maxOldSpaceSize: string = '';

	/**
	 * How many concurrent tasks can a runner execute at a time
	 *
	 * Kept high for backwards compatibility - NewFlow v2 will reduce this to `5`
	 */
	@Env('NEWFLOW_RUNNERS_MAX_CONCURRENCY')
	maxConcurrency: number = 10;

	/**
	 * How long (in seconds) a task is allowed to take for completion, else the
	 * task will be aborted. (In internal mode, the runner will also be
	 * restarted.) Must be greater than 0.
	 *
	 * Kept high for backwards compatibility - NewFlow v2 will reduce this to `60`
	 */
	@Env('NEWFLOW_RUNNERS_TASK_TIMEOUT')
	taskTimeout: number = 300; // 5 minutes

	/** How often (in seconds) the runner must send a heartbeat to the broker, else the task will be aborted. (In internal mode, the runner will also  be restarted.) Must be greater than 0. */
	@Env('NEWFLOW_RUNNERS_HEARTBEAT_INTERVAL')
	heartbeatInterval: number = 30;

	/**
	 * Whether to disable all security measures in the task runner. **Discouraged for production use.**
	 * Set to `true` for compatibility with modules that rely on insecure JS features.
	 */
	@Env('NEWFLOW_RUNNERS_INSECURE_MODE')
	insecureMode: boolean = false;

	/**
	 * Whether to enable the Python task runner (beta). This will replace the
	 * Pyodide option with the native Python option in the Code node. Expects a
	 * Python task runner to be available, typically in a sidecar container.
	 *
	 * Actions required:
	 * - Any Code node set to the legacy `python` parameter will need to be manually
	 * updated to use the new `pythonNative` parameter.
	 * - Any Code node script relying on Pyodide syntax is likely to need to be manually
	 * adjusted to account for breaking changes:
	 * http://newflow.ee/integrations/builtin/core-nodes/n8n-nodes-base.code/#python-native-beta
	 */
	@Env('NEWFLOW_NATIVE_PYTHON_RUNNER')
	isNativePythonRunnerEnabled: boolean = false;
}
