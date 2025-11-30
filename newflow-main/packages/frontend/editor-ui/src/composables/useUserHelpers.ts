/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RouteLocation, RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { hasPermission } from '@/utils/rbac/permissions';
import type { PermissionTypeOptions } from '@/types/rbac';

export function useUserHelpers(router: Router, route: RouteLocationNormalizedLoaded) {
	const canUserAccessRouteByName = (name: string) => {
		const resolvedRoute = router.resolve({ name });

		return canUserAccessRoute(resolvedRoute);
	};

	const canUserAccessCurrentRoute = () => {
		return canUserAccessRoute(route);
	};

	const canUserAccessRoute = (route: RouteLocation) => {
		const middleware = route.meta?.middleware;
		const middlewareOptions = route.meta?.middlewareOptions;

		if (!middleware) {
			return true;
		}

		return hasPermission(middleware, middlewareOptions as PermissionTypeOptions | undefined);
	};

	return {
		canUserAccessRouteByName,
		canUserAccessCurrentRoute,
		canUserAccessRoute,
	};
}
