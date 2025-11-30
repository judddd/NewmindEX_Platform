<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';
import { useMessage } from '@/composables/useMessage';
import { useDocumentTitle } from '@/composables/useDocumentTitle';

import { useSettingsStore } from '@/stores/settings.store';
import { useCloudPlanStore } from '@/stores/cloudPlan.store';
import { API_KEY_CREATE_OR_EDIT_MODAL_KEY, DOCS_DOMAIN, MODAL_CONFIRM } from '@/constants';
import { useI18n } from '@newflow/i18n';
import { useTelemetry } from '@/composables/useTelemetry';
import { usePageRedirectionHelper } from '@/composables/usePageRedirectionHelper';
import { useUIStore } from '@/stores/ui.store';
import { useApiKeysStore } from '@/stores/apiKeys.store';
import { storeToRefs } from 'pinia';
import { useRootStore } from '@newflow/stores/useRootStore';

const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const cloudPlanStore = useCloudPlanStore();

const { showError, showMessage } = useToast();
const { confirm } = useMessage();
const documentTitle = useDocumentTitle();
const i18n = useI18n();
const { goToUpgrade } = usePageRedirectionHelper();
const telemetry = useTelemetry();

const loading = ref(false);
const apiKeysStore = useApiKeysStore();
const { getAndCacheApiKeys, deleteApiKey, getApiKeyAvailableScopes } = apiKeysStore;
const { apiKeysSortByCreationDate } = storeToRefs(apiKeysStore);
const { isSwaggerUIEnabled, publicApiPath, publicApiLatestVersion, isAutoSetupMode } =
	settingsStore;
const { baseUrl } = useRootStore();

const { isPublicApiEnabled } = settingsStore;

const apiDocsURL = ref('');

// NewFlow: Detect predefined API keys (label starts with "Predefined:")
const hasPredefinedKeys = computed(() => {
	return apiKeysSortByCreationDate.value.some((key) => key.label?.startsWith('Predefined:'));
});

const isPredefinedKey = (label: string) => {
	return label?.startsWith('Predefined:');
};

const onCreateApiKey = async () => {
	telemetry.track('User clicked create API key button');

	uiStore.openModalWithData({
		name: API_KEY_CREATE_OR_EDIT_MODAL_KEY,
		data: { mode: 'new' },
	});
};

onMounted(async () => {
	documentTitle.set(i18n.baseText('settings.api'));

	apiDocsURL.value = isSwaggerUIEnabled
		? `${baseUrl}${publicApiPath}/v${publicApiLatestVersion}/docs`
		: `https://${DOCS_DOMAIN}/api/api-reference/`;

	if (!isPublicApiEnabled) return;

	await getApiKeysAndScopes();
});

function onUpgrade() {
	void goToUpgrade('settings-n8n-api', 'upgrade-api', 'redirect');
}

async function getApiKeysAndScopes() {
	try {
		loading.value = true;
		await Promise.all([getAndCacheApiKeys(), getApiKeyAvailableScopes()]);
	} catch (error) {
		showError(error, i18n.baseText('settings.api.view.error'));
	} finally {
		loading.value = false;
	}
}

async function onDelete(id: string) {
	// NewFlow: Prevent deletion of predefined keys
	const apiKey = apiKeysSortByCreationDate.value.find((key) => key.id === id);
	if (apiKey && isPredefinedKey(apiKey.label || '')) {
		showError(
			new Error('Cannot delete predefined API key'),
			i18n.baseText('settings.api.predefinedKey.cannotDelete'),
		);
		return;
	}

	const confirmed = await confirm(
		i18n.baseText('settings.api.delete.description'),
		i18n.baseText('settings.api.delete.title'),
		{
			confirmButtonText: i18n.baseText('settings.api.delete.button'),
			cancelButtonText: i18n.baseText('generic.cancel'),
		},
	);

	if (confirmed === MODAL_CONFIRM) {
		try {
			await deleteApiKey(id);
			showMessage({
				title: i18n.baseText('settings.api.delete.toast'),
				type: 'success',
			});
		} catch (e) {
			showError(e, i18n.baseText('settings.api.delete.error'));
		} finally {
			telemetry.track('User clicked delete API key button');
		}
	}
}

function onEdit(id: string) {
	// NewFlow: Prevent editing of predefined keys
	const apiKey = apiKeysSortByCreationDate.value.find((key) => key.id === id);
	if (apiKey && isPredefinedKey(apiKey.label || '')) {
		showError(
			new Error('Cannot edit predefined API key'),
			i18n.baseText('settings.api.predefinedKey.cannotEdit'),
		);
		return;
	}

	uiStore.openModalWithData({
		name: API_KEY_CREATE_OR_EDIT_MODAL_KEY,
		data: { mode: 'edit', activeId: id },
	});
}
</script>

<template>
	<div :class="$style.container">
		<div :class="$style.header">
			<n8n-heading size="2xlarge">
				{{ i18n.baseText('settings.api') }}
			</n8n-heading>
		</div>

		<!-- NewFlow: Display predefined key notice in auto-setup mode -->
		<n8n-notice
			v-if="isAutoSetupMode && hasPredefinedKeys"
			type="info"
			:class="$style.predefinedNotice"
		>
			{{ i18n.baseText('settings.api.predefinedKey.notice') }}
		</n8n-notice>

		<p v-if="isPublicApiEnabled && apiKeysSortByCreationDate.length" :class="$style.topHint">
			<n8n-text>
				<I18nT keypath="settings.api.view.info" tag="span" scope="global">
					<template #apiAction>
						<!-- NewFlow: Remove API docs link, display text only -->
						<span v-text="i18n.baseText('settings.api.view.info.api')" />
					</template>
					<template #webhookAction>
						<!-- NewFlow: Remove webhook link, display text only -->
						<span v-text="i18n.baseText('settings.api.view.info.webhook')" />
					</template>
				</I18nT>
			</n8n-text>
		</p>

		<div :class="$style.apiKeysContainer">
			<template v-if="apiKeysSortByCreationDate.length">
				<el-row
					v-for="(apiKey, index) in apiKeysSortByCreationDate"
					:key="apiKey.id"
					:gutter="10"
					:class="[{ [$style.destinationItem]: index !== apiKeysSortByCreationDate.length - 1 }]"
				>
					<el-col>
						<ApiKeyCard :api-key="apiKey" @delete="onDelete" @edit="onEdit" />
					</el-col>
				</el-row>
			</template>
		</div>

		<!-- NewFlow: Hide API Playground/docs link for appliance mode -->
		<!--
		<div v-if="isPublicApiEnabled && apiKeysSortByCreationDate.length" :class="$style.BottomHint">
			<N8nText size="small" color="text-light">
				{{
					i18n.baseText(
						`settings.api.view.${settingsStore.isSwaggerUIEnabled ? 'tryapi' : 'more-details'}`,
					)
				}}
			</N8nText>
			{{ ' ' }}
			<n8n-link
				v-if="isSwaggerUIEnabled"
				data-test-id="api-playground-link"
				:to="apiDocsURL"
				:new-window="true"
				size="small"
			>
				{{ i18n.baseText('settings.api.view.apiPlayground') }}
			</n8n-link>
			<n8n-link
				v-else
				data-test-id="api-endpoint-docs-link"
				:to="apiDocsURL"
				:new-window="true"
				size="small"
			>
				{{ i18n.baseText(`settings.api.view.external-docs`) }}
			</n8n-link>
		</div>
		-->
		<!-- NewFlow: Allow creating new API keys even when predefined keys exist -->
		<div class="mt-m text-right">
			<n8n-button
				v-if="isPublicApiEnabled && apiKeysSortByCreationDate.length"
				size="large"
				@click="onCreateApiKey"
			>
				{{ i18n.baseText('settings.api.create.button') }}
			</n8n-button>
		</div>

		<n8n-action-box
			v-if="!isPublicApiEnabled && cloudPlanStore.userIsTrialing"
			data-test-id="public-api-upgrade-cta"
			:heading="i18n.baseText('settings.api.trial.upgradePlan.title')"
			:description="i18n.baseText('settings.api.trial.upgradePlan.description')"
			:button-text="i18n.baseText('settings.api.trial.upgradePlan.cta')"
			@click:button="onUpgrade"
		/>

		<n8n-action-box
			v-if="isPublicApiEnabled && !apiKeysSortByCreationDate.length"
			:button-text="
				i18n.baseText(loading ? 'settings.api.create.button.loading' : 'settings.api.create.button')
			"
			:description="i18n.baseText('settings.api.create.description')"
			@click:button="onCreateApiKey"
		/>
	</div>
</template>

<style lang="scss" module>
.header {
	display: flex;
	align-items: center;
	white-space: nowrap;
	margin-bottom: var(--spacing-xl);

	*:first-child {
		flex-grow: 1;
	}
}

.predefinedNotice {
	margin-bottom: var(--spacing-m);
}

.card {
	position: relative;
}

.destinationItem {
	margin-bottom: var(--spacing-2xs);
}

.delete {
	position: absolute;
	display: inline-block;
	top: var(--spacing-s);
	right: var(--spacing-s);
}

.topHint {
	margin-top: none;
	margin-bottom: var(--spacing-s);
	color: var(--color-text-light);

	span {
		font-size: var(--font-size-s);
		line-height: var(--font-line-height-loose);
		font-weight: var(--font-weight-regular);
	}
}

.BottomHint {
	margin-bottom: var(--spacing-s);
	margin-top: var(--spacing-s);
}

.apiKeysContainer {
	max-height: 45vh;
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-width: none;
}
</style>
