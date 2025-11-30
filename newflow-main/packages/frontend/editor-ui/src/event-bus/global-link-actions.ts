/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LinkActionFn = (...args: any[]) => void;

export type RegisterCustomActionOpts = {
	key: string;
	action: LinkActionFn;
};

export interface GlobalLinkActionsEventBusEvents {
	/** See useGlobalLinkActions.ts */
	registerGlobalLinkAction: RegisterCustomActionOpts;
}

export const globalLinkActionsEventBus = createEventBus<GlobalLinkActionsEventBusEvents>();
