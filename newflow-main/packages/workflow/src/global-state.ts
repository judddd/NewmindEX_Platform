/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { deepCopy } from './utils';

export interface GlobalState {
	defaultTimezone: string;
}

let globalState: GlobalState = { defaultTimezone: 'America/New_York' };

export function setGlobalState(state: GlobalState) {
	globalState = state;
}

export function getGlobalState() {
	return deepCopy(globalState);
}
