/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NodeConnectionType, ITaskData } from 'n8n-workflow';
import { isNodeConnectionType } from 'n8n-workflow';

export function getItemCountByConnectionType(
	data: ITaskData['data'],
): Partial<Record<NodeConnectionType, number[]>> {
	const itemCountByConnectionType: Partial<Record<NodeConnectionType, number[]>> = {};

	for (const [connectionType, connectionData] of Object.entries(data ?? {})) {
		if (!isNodeConnectionType(connectionType)) {
			continue;
		}

		if (Array.isArray(connectionData)) {
			itemCountByConnectionType[connectionType] = connectionData.map((d) => (d ? d.length : 0));
		} else {
			itemCountByConnectionType[connectionType] = [0];
		}
	}

	return itemCountByConnectionType;
}
