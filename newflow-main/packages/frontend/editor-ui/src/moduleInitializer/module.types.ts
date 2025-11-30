/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ModalState } from '@/Interface';
import type { DynamicTabOptions } from '@/utils/modules/tabUtils';
import type { RouteRecordRaw } from 'vue-router';
import type { Component } from 'vue/dist/vue.js';

export type ModalDefinition = {
	key: string;
	component: Component | (() => Promise<Component>);
	initialState?: ModalState;
};

export type ResourceMetadata = {
	key: string;
	displayName: string;
	i18nKeys?: Record<string, string>;
};

export type FrontendModuleDescription = {
	id: string;
	name: string;
	description: string;
	icon: string;
	routes?: RouteRecordRaw[];
	projectTabs?: {
		overview?: DynamicTabOptions[];
		project?: DynamicTabOptions[];
		shared?: DynamicTabOptions[];
	};
	resources?: ResourceMetadata[];
	modals?: ModalDefinition[];
};
