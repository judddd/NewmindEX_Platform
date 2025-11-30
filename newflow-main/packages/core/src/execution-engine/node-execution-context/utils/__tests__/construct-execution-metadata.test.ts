/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INodeExecutionData, IPairedItemData, NodeExecutionWithMetadata } from 'n8n-workflow';

import { constructExecutionMetaData } from '../construct-execution-metadata';

describe('constructExecutionMetaData', () => {
	const tests: Array<{
		description: string;
		inputData: INodeExecutionData[];
		itemData: IPairedItemData | IPairedItemData[];
		expected: NodeExecutionWithMetadata[];
	}> = [
		{
			description: 'should add pairedItem to single input data',
			inputData: [{ json: { name: 'John' } }],
			itemData: { item: 0 },
			expected: [{ json: { name: 'John' }, pairedItem: { item: 0 } }],
		},
		{
			description: 'should add pairedItem to multiple input data with different properties',
			inputData: [{ json: { name: 'John' } }, { json: { name: 'Jane' } }],
			itemData: [{ item: 0 }, { item: 1 }],
			expected: [
				{ json: { name: 'John' }, pairedItem: [{ item: 0 }, { item: 1 }] },
				{ json: { name: 'Jane' }, pairedItem: [{ item: 0 }, { item: 1 }] },
			],
		},
		{
			description: 'should handle empty input data and itemData',
			inputData: [],
			itemData: [],
			expected: [],
		},
		{
			description: 'should handle multiple pairedItem with single input data',
			inputData: [{ json: { name: 'John' } }],
			itemData: [{ item: 0 }, { item: 1 }],
			expected: [{ json: { name: 'John' }, pairedItem: [{ item: 0 }, { item: 1 }] }],
		},
	];
	test.each(tests)('$description', ({ inputData, itemData, expected }) => {
		const result = constructExecutionMetaData(inputData, { itemData });
		expect(result).toEqual(expected);
	});
});
