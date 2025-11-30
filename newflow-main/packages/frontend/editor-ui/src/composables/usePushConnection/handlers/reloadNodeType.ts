/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useNodeTypesStore } from '@/stores/nodeTypes.store';
import type { ReloadNodeType } from '@newflow/api-types/push/hot-reload';
import { isCommunityPackageName } from '../../../utils/nodeTypesUtils';

/**
 * Handles the 'reloadNodeType' event from the push connection, which indicates
 * that a node type needs to be reloaded.
 */
export async function reloadNodeType({ data }: ReloadNodeType) {
	const nodeTypesStore = useNodeTypesStore();

	await nodeTypesStore.getNodeTypes();
	const isCommunityNode = isCommunityPackageName(data.name);
	await nodeTypesStore.getFullNodesProperties([data], !isCommunityNode);
}
