/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { NodeConnectionTypes } from 'n8n-workflow';

import { createNodeData, toIConnections } from './helpers';

test('toIConnections', () => {
	const node1 = createNodeData({ name: 'Basic Node 1' });
	const node2 = createNodeData({ name: 'Basic Node 2' });

	expect(
		toIConnections([{ from: node1, to: node2, type: NodeConnectionTypes.Main, outputIndex: 0 }]),
	).toEqual({
		[node1.name]: {
			// output group
			main: [
				// first output
				[
					// first connection
					{
						node: node2.name,
						type: NodeConnectionTypes.Main,
						index: 0,
					},
				],
			],
		},
	});
});
