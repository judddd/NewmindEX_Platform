/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NodeDescriptionUpdated } from '@newflow/api-types/push/hot-reload';
import { useNodeTypesStore } from '@/stores/nodeTypes.store';
import { useCredentialsStore } from '@/stores/credentials.store';

/**
 * Handles the 'nodeDescriptionUpdated' event from the push connection, which indicates
 * that a node description has been updated.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function nodeDescriptionUpdated(_event: NodeDescriptionUpdated) {
	const nodeTypesStore = useNodeTypesStore();
	const credentialsStore = useCredentialsStore();

	await nodeTypesStore.getNodeTypes();
	await credentialsStore.fetchCredentialTypes(true);
}
