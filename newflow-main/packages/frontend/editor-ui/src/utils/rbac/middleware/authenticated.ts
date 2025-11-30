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
import type { AuthenticatedPermissionOptions } from '@/types/rbac';
import { isAuthenticated, shouldEnableMfa } from '@/utils/rbac/checks';
import { useSettingsStore } from '@/stores/settings.store';

export const authenticatedMiddleware: RouterMiddleware<AuthenticatedPermissionOptions> = async (
	to,
	_from,
	next,
	options,
) => {
	// NewFlow: Skip authentication in auto-setup mode
	const settingsStore = useSettingsStore();
	if (settingsStore.isAutoSetupMode) {
		return; // Skip authentication check
	}

	// ensure that we are removing the already existing redirect query parameter
	// to avoid infinite redirect loops
	const url = new URL(window.location.href);
	url.searchParams.delete('redirect');
	const redirect = to.query.redirect ?? encodeURIComponent(`${url.pathname}${url.search}`);

	const valid = isAuthenticated(options);
	if (!valid) {
		return next({ name: VIEWS.SIGNIN, query: { redirect } });
	}

	// If MFA is not enabled, and the instance enforces MFA, redirect to personal settings
	const mfaNeeded = shouldEnableMfa();
	if (mfaNeeded) {
		if (to.name !== VIEWS.PERSONAL_SETTINGS) {
			return next({ name: VIEWS.PERSONAL_SETTINGS, query: { redirect } });
		}
		return;
	}
};
