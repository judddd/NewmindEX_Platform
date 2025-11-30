/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RouteLocationRaw } from 'vue-router';
import type { TabOptions } from '@newflow/design-system';

export type DynamicTabOptions = TabOptions<string> & {
	dynamicRoute?: {
		name: string;
		includeProjectId?: boolean;
	};
};

/**
 * Process dynamic route configuration for tabs
 * Resolves dynamic routes with project IDs and other parameters
 */
export function processDynamicTab(tab: DynamicTabOptions, projectId?: string): TabOptions<string> {
	if (!tab.dynamicRoute) {
		return tab;
	}

	const tabRoute: RouteLocationRaw = {
		name: tab.dynamicRoute.name,
	};

	if (tab.dynamicRoute.includeProjectId && projectId) {
		tabRoute.params = { projectId };
	}

	const { dynamicRoute, ...tabWithoutDynamic } = tab;
	return {
		...tabWithoutDynamic,
		to: tabRoute,
	};
}

/**
 * Process an array of tabs with dynamic route resolution
 */
export function processDynamicTabs(
	tabs: DynamicTabOptions[],
	projectId?: string,
): Array<TabOptions<string>> {
	return tabs.map((tab) => processDynamicTab(tab, projectId));
}
