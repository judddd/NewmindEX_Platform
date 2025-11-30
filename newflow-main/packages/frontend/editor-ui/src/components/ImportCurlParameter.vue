<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
import { IMPORT_CURL_MODAL_KEY } from '@/constants';
import { useUIStore } from '@/stores/ui.store';

defineProps<{
	isReadOnly?: boolean;
}>();

const uiStore = useUIStore();
const i18n = useI18n();

function onImportCurlClicked() {
	uiStore.openModal(IMPORT_CURL_MODAL_KEY);
}
</script>

<template>
	<div :class="$style.importSection">
		<n8n-button
			type="secondary"
			:label="i18n.baseText('importCurlParameter.label')"
			:disabled="isReadOnly"
			size="mini"
			@click="onImportCurlClicked"
		/>
	</div>
</template>

<style module lang="scss">
.importSection {
	display: flex;
	flex-direction: row-reverse;
	margin-top: var(--spacing-xs);
}
</style>
