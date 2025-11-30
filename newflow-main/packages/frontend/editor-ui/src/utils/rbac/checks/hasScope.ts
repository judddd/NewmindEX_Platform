/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useRBACStore } from '@/stores/rbac.store';
import type { RBACPermissionCheck, RBACPermissionOptions } from '@/types/rbac';

export const hasScope: RBACPermissionCheck<RBACPermissionOptions> = (opts) => {
	if (!opts?.scope) {
		return true;
	}
	const { projectId, resourceType, resourceId, scope, options } = opts;

	const rbacStore = useRBACStore();
	return rbacStore.hasScope(
		scope,
		{
			projectId,
			resourceType,
			resourceId,
		},
		options,
	);
};
