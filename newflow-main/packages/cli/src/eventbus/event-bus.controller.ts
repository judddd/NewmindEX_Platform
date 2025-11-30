/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RestController, Get } from '@newflow/decorators';

import { eventNamesAll } from './event-message-classes';
import { MessageEventBus } from './message-event-bus/message-event-bus';

// Enterprise log streaming destinations have been removed
// Only basic event names API remains

@RestController('/eventbus')
export class EventBusController {
	constructor(private readonly eventBus: MessageEventBus) {}

	// Get available event names (open source feature)
	@Get('/eventnames')
	async getEventNames(): Promise<string[]> {
		return eventNamesAll;
	}

	// Enterprise log streaming destination endpoints have been removed:
	// - GET /destination (list destinations)
	// - POST /destination (create destination)
	// - GET /testmessage (test destination)
	// - DELETE /destination (delete destination)
	//
	// Logs are still written to ~/.n8n/eventBus.log automatically
}
