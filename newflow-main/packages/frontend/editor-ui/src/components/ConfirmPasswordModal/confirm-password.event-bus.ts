/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';

export interface ConfirmPasswordClosedEventPayload {
	currentPassword: string;
}

export interface ConfirmPasswordModalEvents {
	close: ConfirmPasswordClosedEventPayload | undefined;
}

export const confirmPasswordEventBus = createEventBus<ConfirmPasswordModalEvents>();
