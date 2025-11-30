/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RouterMiddleware } from '@/types/router';
import { VIEWS } from '@/constants';
import {
	inferProjectIdFromRoute,
	inferResourceIdFromRoute,
	inferResourceTypeFromRoute,
} from '@/utils/rbacUtils';
import type { RBACPermissionOptions } from '@/types/rbac';
import { hasScope } from '@/utils/rbac/checks';

export const rbacMiddleware: RouterMiddleware<RBACPermissionOptions> = async (
	to,
	_from,
	next,
	{ scope, options },
) => {
	const projectId = inferProjectIdFromRoute(to);
	const resourceType = inferResourceTypeFromRoute(to);
	const resourceId = resourceType ? inferResourceIdFromRoute(to) : undefined;

	const valid = hasScope({ scope, projectId, resourceType, resourceId, options });
	if (!valid) {
		return next({ name: VIEWS.HOMEPAGE });
	}
};
