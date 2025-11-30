/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';

export const mfaEventBus = createEventBus();

export interface MfaModalClosedEventPayload {
	mfaCode?: string;
	mfaRecoveryCode?: string;
}

export interface MfaModalEvents {
	/** Command to request closing of the modal */
	close: MfaModalClosedEventPayload | undefined;

	/** Event that the modal has been closed */
	closed: MfaModalClosedEventPayload | undefined;
}

/**
 * Event bus for transmitting the MFA code from a modal back to the view
 */
export const promptMfaCodeBus = createEventBus<MfaModalEvents>();
