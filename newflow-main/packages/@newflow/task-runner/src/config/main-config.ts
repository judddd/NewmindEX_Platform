/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Nested } from '@newflow/config';

import { BaseRunnerConfig } from './base-runner-config';
import { JsRunnerConfig } from './js-runner-config';
import { SentryConfig } from './sentry-config';

@Config
export class MainConfig {
	@Nested
	baseRunnerConfig!: BaseRunnerConfig;

	@Nested
	jsRunnerConfig!: JsRunnerConfig;

	@Nested
	sentryConfig!: SentryConfig;
}
