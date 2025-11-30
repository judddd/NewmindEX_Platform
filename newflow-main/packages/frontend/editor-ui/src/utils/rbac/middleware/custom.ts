/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { CustomMiddlewareOptions, RouterMiddleware } from '@/types/router';
import { VIEWS } from '@/constants';

export const customMiddleware: RouterMiddleware<CustomMiddlewareOptions> = async (
	to,
	from,
	next,
	isValid,
) => {
	const valid = isValid({ to, from, next });
	if (!valid) {
		return next({ name: VIEWS.HOMEPAGE });
	}
};
