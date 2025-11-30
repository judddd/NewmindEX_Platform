/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Event } from '@sentry/node';

export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info';

export type ErrorTags = NonNullable<Event['tags']>;

export type ReportingOptions = {
	/** Whether the error should be reported to Sentry */
	shouldReport?: boolean;
	/** Whether the error log should be logged (default to true) */
	shouldBeLogged?: boolean;
	level?: ErrorLevel;
	tags?: ErrorTags;
	extra?: Event['extra'];
	executionId?: string;
};
