/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/* eslint-disable @typescript-eslint/no-for-in-array */

import type { IConnections, NodeConnectionType } from '../interfaces';

export function mapConnectionsByDestination(connections: IConnections) {
	const returnConnection: IConnections = {};

	let connectionInfo;
	let maxIndex: number;
	for (const sourceNode in connections) {
		if (!connections.hasOwnProperty(sourceNode)) {
			continue;
		}

		for (const type of Object.keys(connections[sourceNode]) as NodeConnectionType[]) {
			if (!connections[sourceNode].hasOwnProperty(type)) {
				continue;
			}

			for (const inputIndex in connections[sourceNode][type]) {
				if (!connections[sourceNode][type].hasOwnProperty(inputIndex)) {
					continue;
				}

				for (connectionInfo of connections[sourceNode][type][inputIndex] ?? []) {
					if (!returnConnection.hasOwnProperty(connectionInfo.node)) {
						returnConnection[connectionInfo.node] = {};
					}
					if (!returnConnection[connectionInfo.node].hasOwnProperty(connectionInfo.type)) {
						returnConnection[connectionInfo.node][connectionInfo.type] = [];
					}

					maxIndex = returnConnection[connectionInfo.node][connectionInfo.type].length - 1;
					for (let j = maxIndex; j < connectionInfo.index; j++) {
						returnConnection[connectionInfo.node][connectionInfo.type].push([]);
					}

					returnConnection[connectionInfo.node][connectionInfo.type][connectionInfo.index]?.push({
						node: sourceNode,
						type,
						index: parseInt(inputIndex, 10),
					});
				}
			}
		}
	}

	return returnConnection;
}
