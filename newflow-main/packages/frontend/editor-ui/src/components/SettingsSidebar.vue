<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import { ABOUT_MODAL_KEY, VIEWS } from '@/constants';
import { useUserHelpers } from '@/composables/useUserHelpers';
import type { IMenuItem } from '@newflow/design-system';
import { useUIStore } from '@/stores/ui.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useRootStore } from '@newflow/stores/useRootStore';
import { hasPermission } from '@/utils/rbac/permissions';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@newflow/i18n';

const emit = defineEmits<{
	return: [];
}>();

const router = useRouter();
const route = useRoute();
const i18n = useI18n();

const { canUserAccessRouteByName } = useUserHelpers(router, route);

const rootStore = useRootStore();
const settingsStore = useSettingsStore();
const uiStore = useUIStore();

const sidebarMenuItems = computed<IMenuItem[]>(() => {
	const menuItems: IMenuItem[] = [
		// 使用量和计划 - 已隐藏（企业本地部署版本）
		{
			id: 'settings-personal',
			icon: 'circle-user-round',
			label: i18n.baseText('settings.personal'),
			position: 'top',
			available: canUserAccessRouteByName(VIEWS.PERSONAL_SETTINGS),
			route: { to: { name: VIEWS.PERSONAL_SETTINGS } },
		},
		{
			id: 'settings-users',
			icon: 'users',
			label: i18n.baseText('settings.users'),
			position: 'top',
			available: canUserAccessRouteByName(VIEWS.USERS_SETTINGS),
			route: { to: { name: VIEWS.USERS_SETTINGS } },
		},
		{
			id: 'settings-api',
			icon: 'plug',
			label: i18n.baseText('settings.n8napi'),
			position: 'top',
			available: settingsStore.isPublicApiEnabled && canUserAccessRouteByName(VIEWS.API_SETTINGS),
			route: { to: { name: VIEWS.API_SETTINGS } },
		},
		// External Secrets设置 - 已隐藏（企业本地部署版本）

		// NewFlow: Worker View removed
		// {
		// 	id: 'settings-workersview',
		// 	icon: 'waypoints',
		// 	label: i18n.baseText('mainSidebar.workersView'),
		// 	position: 'top',
		// 	available:
		// 		settingsStore.isQueueModeEnabled &&
		// 		hasPermission(['rbac'], { rbac: { scope: 'workersView:manage' } }),
		// 	route: { to: { name: VIEWS.WORKER_VIEW } },
		// },
	];

	// Log Streaming设置 - 已隐藏（企业本地部署版本，功能代码保留）

	// Community Nodes设置 - 已隐藏（企业本地部署版本）

	return menuItems;
});
</script>

<template>
	<div :class="$style.container">
		<n8n-menu :items="sidebarMenuItems">
			<template #header>
				<div :class="$style.returnButton" data-test-id="settings-back" @click="emit('return')">
					<i class="mr-xs">
						<n8n-icon icon="arrow-left" />
					</i>
					<n8n-heading size="large" :bold="true">{{ i18n.baseText('settings') }}</n8n-heading>
				</div>
			</template>
			<template #menuSuffix>
				<div :class="$style.versionContainer">
					<n8n-link size="small" @click="uiStore.openModal(ABOUT_MODAL_KEY)">
						{{ i18n.baseText('settings.version') }} {{ rootStore.versionCli }}
					</n8n-link>
				</div>
			</template>
		</n8n-menu>
	</div>
</template>

<style lang="scss" module>
.container {
	min-width: $sidebar-expanded-width;
	height: 100%;
	background-color: var(--color-background-xlight);
	border-right: var(--border-base);
	position: relative;
	overflow: auto;
}

.returnButton {
	padding: var(--spacing-s) var(--spacing-l);
	cursor: pointer;
	&:hover {
		color: var(--color-primary);
	}
}

.versionContainer {
	padding: var(--spacing-xs) var(--spacing-l);
}

@media screen and (max-height: 420px) {
	.versionContainer {
		display: none;
	}
}
</style>
