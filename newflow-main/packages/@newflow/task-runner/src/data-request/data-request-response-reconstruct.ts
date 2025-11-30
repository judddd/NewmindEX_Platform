/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IExecuteData, INodeExecutionData, ITaskDataConnections } from 'n8n-workflow';

import type { DataRequestResponse, InputDataChunkDefinition } from '@/runner-types';

/**
 * Reconstructs data from a DataRequestResponse to the initial
 * data structures.
 */
export class DataRequestResponseReconstruct {
	/**
	 * Reconstructs `inputData` from a DataRequestResponse
	 */
	reconstructConnectionInputItems(
		inputData: DataRequestResponse['inputData'],
		chunk?: InputDataChunkDefinition,
	): Array<INodeExecutionData | undefined> {
		const inputItems = inputData?.main?.[0] ?? [];
		if (!chunk) {
			return inputItems;
		}

		// Only a chunk of the input items was requested. We reconstruct
		// the array by filling in the missing items with `undefined`.
		let sparseInputItems: Array<INodeExecutionData | undefined> = [];

		sparseInputItems = sparseInputItems
			.concat(Array.from({ length: chunk.startIndex }))
			.concat(inputItems)
			.concat(Array.from({ length: inputItems.length - chunk.startIndex - chunk.count }));

		return sparseInputItems;
	}

	/**
	 * Reconstruct `executeData` from a DataRequestResponse
	 */
	reconstructExecuteData(
		response: DataRequestResponse,
		inputItems: INodeExecutionData[],
	): IExecuteData {
		const inputData: ITaskDataConnections = {
			...response.inputData,
			main: [inputItems],
		};

		return {
			data: inputData,
			node: response.node,
			source: response.connectionInputSource,
		};
	}
}
