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
	interface NodeData<C, J extends N8nJson, B extends string, P> {
		context: C;
		item: N8nItem<J, B>;
		params: P;
	}

	// @ts-expect-error N8nInputJson is populated dynamically
	type N8nInput = NodeData<{}, N8nInputJson, {}, {}>;

	const $itemIndex: number;
	const $json: N8nInput['item']['json'];
	const $binary: N8nInput['item']['binary'];
}
