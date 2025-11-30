/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export {};

declare global {
	interface NodeData<C = any, J extends N8nJson = any, B extends string = string, P = any> {
		context: C;
		params: P;
		all(branchIndex?: number, runIndex?: number): Array<N8nItem<J, B>>;
		first(branchIndex?: number, runIndex?: number): N8nItem<J, B>;
		last(branchIndex?: number, runIndex?: number): N8nItem<J, B>;
		itemMatching(itemIndex: number): N8nItem<J, B>;
	}

	// @ts-expect-error N8nInputJson is populated dynamically
	type N8nInput = NodeData<N8nInputContext, N8nInputJson, N8nInputBinaryKeys, N8nInputParams>;
}
