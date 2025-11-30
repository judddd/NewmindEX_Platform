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
import type { EnterprisePermissionOptions } from '@/types/rbac';
import { isEnterpriseFeatureEnabled } from '@/utils/rbac/checks';

export const enterpriseMiddleware: RouterMiddleware<EnterprisePermissionOptions> = async (
	_to,
	_from,
	next,
	options,
) => {
	const valid = isEnterpriseFeatureEnabled(options);
	if (!valid) {
		return next({ name: VIEWS.HOMEPAGE });
	}
};
