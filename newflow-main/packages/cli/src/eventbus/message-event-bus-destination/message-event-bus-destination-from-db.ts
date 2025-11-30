/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { EventDestinations } from '@newflow/db';

import type { MessageEventBus } from '../message-event-bus/message-event-bus';

// Enterprise log streaming destinations have been removed
// This function now always returns null
export function messageEventBusDestinationFromDb(
	_eventBusInstance: MessageEventBus,
	_dbData: EventDestinations,
): null {
	return null;
}
