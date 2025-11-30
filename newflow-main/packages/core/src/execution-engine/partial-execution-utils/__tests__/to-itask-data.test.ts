/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { NodeConnectionTypes } from 'n8n-workflow';

import { toITaskData } from './helpers';

test('toITaskData', function () {
	expect(toITaskData([{ data: { value: 1 } }])).toEqual({
		executionStatus: 'success',
		executionTime: 0,
		source: [],
		startTime: 0,
		executionIndex: 0,
		data: {
			main: [[{ json: { value: 1 } }]],
		},
	});

	expect(toITaskData([{ data: { value: 1 }, outputIndex: 1 }])).toEqual({
		executionStatus: 'success',
		executionTime: 0,
		source: [],
		startTime: 0,
		executionIndex: 0,
		data: {
			main: [null, [{ json: { value: 1 } }]],
		},
	});

	expect(
		toITaskData([
			{ data: { value: 1 }, outputIndex: 1, nodeConnectionType: NodeConnectionTypes.AiAgent },
		]),
	).toEqual({
		executionStatus: 'success',
		executionTime: 0,
		source: [],
		startTime: 0,
		executionIndex: 0,
		data: {
			[NodeConnectionTypes.AiAgent]: [null, [{ json: { value: 1 } }]],
		},
	});

	expect(
		toITaskData([
			{ data: { value: 1 }, outputIndex: 0 },
			{ data: { value: 2 }, outputIndex: 1 },
		]),
	).toEqual({
		executionStatus: 'success',
		executionTime: 0,
		startTime: 0,
		executionIndex: 0,
		source: [],
		data: {
			main: [
				[
					{
						json: { value: 1 },
					},
				],
				[
					{
						json: { value: 2 },
					},
				],
			],
		},
	});
});
