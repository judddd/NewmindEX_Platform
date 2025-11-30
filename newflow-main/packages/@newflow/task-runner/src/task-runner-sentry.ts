/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import type { ErrorEvent, Exception } from '@sentry/core';
import { ErrorReporter } from 'n8n-core';

import { SentryConfig } from './config/sentry-config';

/**
 * Sentry service for the task runner.
 */
@Service()
export class TaskRunnerSentry {
	constructor(
		private readonly config: SentryConfig,
		private readonly errorReporter: ErrorReporter,
	) {}

	async initIfEnabled() {
		const { dsn, n8nVersion, environment, deploymentName } = this.config;

		if (!dsn) return;

		await this.errorReporter.init({
			serverType: 'task_runner',
			dsn,
			release: `n8n@${n8nVersion}`,
			environment,
			serverName: deploymentName,
			beforeSendFilter: this.filterOutUserCodeErrors,
			withEventLoopBlockDetection: false,
		});
	}

	async shutdown() {
		if (!this.config.dsn) return;

		await this.errorReporter.shutdown();
	}

	/**
	 * Filter out errors originating from user provided code.
	 * It is possible for users to create code that causes unhandledrejections
	 * that end up in the sentry error reporting.
	 */
	filterOutUserCodeErrors = (event: ErrorEvent) => {
		const error = event?.exception?.values?.[0];

		return error ? this.isUserCodeError(error) : false;
	};

	/**
	 * Check if the error is originating from user provided code.
	 * It is possible for users to create code that causes unhandledrejections
	 * that end up in the sentry error reporting.
	 */
	private isUserCodeError(error: Exception) {
		const frames = error.stacktrace?.frames;
		if (!frames) return false;

		return frames.some(
			(frame) => frame.filename === 'node:vm' && frame.function === 'runInContext',
		);
	}
}
