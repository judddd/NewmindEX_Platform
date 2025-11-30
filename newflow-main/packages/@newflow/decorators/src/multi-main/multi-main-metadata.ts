/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';

import type { EventHandler } from '../types';

export const LEADER_TAKEOVER_EVENT_NAME = 'leader-takeover';
export const LEADER_STEPDOWN_EVENT_NAME = 'leader-stepdown';

export type MultiMainEvent = typeof LEADER_TAKEOVER_EVENT_NAME | typeof LEADER_STEPDOWN_EVENT_NAME;

type MultiMainEventHandler = EventHandler<MultiMainEvent>;

@Service()
export class MultiMainMetadata {
	private readonly handlers: MultiMainEventHandler[] = [];

	register(handler: MultiMainEventHandler) {
		this.handlers.push(handler);
	}

	getHandlers(): MultiMainEventHandler[] {
		return this.handlers;
	}
}
