/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { DateTime } from 'luxon';
import type { EventMessageTypeNames } from 'n8n-workflow';

import type { EventNamesTypes } from '.';
import type { AbstractEventPayload } from './abstract-event-payload';

export interface AbstractEventMessageOptions {
	__type?: EventMessageTypeNames;
	id?: string;
	ts?: DateTime | string;
	eventName: EventNamesTypes;
	message?: string;
	payload?: AbstractEventPayload;
	anonymize?: boolean;
}
