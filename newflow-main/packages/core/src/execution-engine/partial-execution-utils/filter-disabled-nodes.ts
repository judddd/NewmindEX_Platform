/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { NodeConnectionTypes } from 'n8n-workflow';

import type { DirectedGraph } from './directed-graph';

export function filterDisabledNodes(graph: DirectedGraph): DirectedGraph {
	const filteredGraph = graph.clone();

	for (const node of filteredGraph.getNodes().values()) {
		if (node.disabled) {
			filteredGraph.removeNode(node, {
				reconnectConnections: true,
				skipConnectionFn: (c) => c.type !== NodeConnectionTypes.Main,
			});
		}
	}

	return filteredGraph;
}
