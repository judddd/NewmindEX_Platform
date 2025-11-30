/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RouterMiddleware, RouterMiddlewareType, MiddlewareOptions } from '@/types/router';
import { authenticatedMiddleware } from '@/utils/rbac/middleware/authenticated';
import { enterpriseMiddleware } from '@/utils/rbac/middleware/enterprise';
import { guestMiddleware } from '@/utils/rbac/middleware/guest';
import { rbacMiddleware } from '@/utils/rbac/middleware/rbac';
import { roleMiddleware } from '@/utils/rbac/middleware/role';
import { customMiddleware } from '@/utils/rbac/middleware/custom';
import { defaultUserMiddleware } from '@/utils/rbac/middleware/defaultUser';

type Middleware = {
	[key in RouterMiddlewareType]: RouterMiddleware<MiddlewareOptions[key]>;
};

export const middleware: Middleware = {
	authenticated: authenticatedMiddleware,
	custom: customMiddleware,
	defaultUser: defaultUserMiddleware,
	enterprise: enterpriseMiddleware,
	guest: guestMiddleware,
	rbac: rbacMiddleware,
	role: roleMiddleware,
};
