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
import type { GuestPermissionOptions } from '@/types/rbac';
import { isGuest } from '@/utils/rbac/checks';

export const guestMiddleware: RouterMiddleware<GuestPermissionOptions> = async (
	to,
	_from,
	next,
) => {
	const valid = isGuest();
	if (!valid) {
		const redirect = (to.query.redirect as string) ?? '';

		// Allow local path redirects
		if (redirect.startsWith('/')) {
			return next(redirect);
		}

		try {
			// Only allow origin domain redirects
			const url = new URL(redirect);
			if (url.origin === window.location.origin) {
				return next(redirect);
			}
		} catch {
			// Intentionally fall through to redirect to homepage
			// if the redirect is an invalid URL
		}

		return next({ name: VIEWS.HOMEPAGE });
	}
};
