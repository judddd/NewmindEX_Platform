/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';
import type { IPinData } from 'n8n-workflow';

export type DataPinningDiscoveryEvent = {
	isTooltipVisible: boolean;
};

export type UnpinNodeDataEvent = {
	nodeNames: string[];
};

export interface DataPinningEventBusEvents {
	/** Command to show or hide the data pinning discovery tooltip */
	'data-pinning-discovery': DataPinningDiscoveryEvent;

	/** Event that data has been pinned for workflow */
	'pin-data': IPinData;

	/** Event that data has been unpinned for specific nodes */
	'unpin-data': UnpinNodeDataEvent;
}

export const dataPinningEventBus = createEventBus<DataPinningEventBusEvents>();
