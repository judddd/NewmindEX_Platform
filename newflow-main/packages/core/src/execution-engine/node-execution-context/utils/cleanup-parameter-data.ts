/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { DateTime } from 'luxon';
import type { INodeParameters, NodeParameterValueType } from 'n8n-workflow';

/**
 * Clean up parameter data to make sure that only valid data gets returned
 * INFO: Currently only converts Luxon Dates as we know for sure it will not be breaking
 */
export function cleanupParameterData(inputData: NodeParameterValueType): void {
	if (typeof inputData !== 'object' || inputData === null) {
		return;
	}

	if (Array.isArray(inputData)) {
		inputData.forEach((value) => cleanupParameterData(value as NodeParameterValueType));
		return;
	}

	if (typeof inputData === 'object') {
		Object.keys(inputData).forEach((key) => {
			const value = (inputData as INodeParameters)[key];
			if (typeof value === 'object') {
				if (DateTime.isDateTime(value)) {
					// Is a special luxon date so convert to string
					(inputData as INodeParameters)[key] = value.toString();
				} else {
					cleanupParameterData(value);
				}
			}
		});
	}
}
