/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { JsonObject } from 'n8n-workflow';
import { EventMessageTypeNames } from 'n8n-workflow';

import type { EventNamesExecutionType } from '.';
import { AbstractEventMessage, isEventMessageOptionsWithType } from './abstract-event-message';
import type { AbstractEventMessageOptions } from './abstract-event-message-options';
import type { AbstractEventPayload } from './abstract-event-payload';

export interface EventPayloadExecution extends AbstractEventPayload {
	executionId: string;
}

export interface EventMessageExecutionOptions extends AbstractEventMessageOptions {
	eventName: EventNamesExecutionType;

	payload?: EventPayloadExecution;
}

export class EventMessageExecution extends AbstractEventMessage {
	readonly __type = EventMessageTypeNames.execution;

	eventName: EventNamesExecutionType;

	payload: EventPayloadExecution;

	constructor(options: EventMessageExecutionOptions) {
		super(options);
		if (options.payload) this.setPayload(options.payload);
		if (options.anonymize) {
			this.anonymize();
		}
	}

	setPayload(payload: EventPayloadExecution): this {
		this.payload = payload;
		return this;
	}

	deserialize(data: JsonObject): this {
		if (isEventMessageOptionsWithType(data, this.__type)) {
			this.setOptionsOrDefault(data);
			if (data.payload) this.setPayload(data.payload as EventPayloadExecution);
		}
		return this;
	}
}
