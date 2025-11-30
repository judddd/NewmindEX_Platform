<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from '@newflow/i18n';
import { N8nCallout } from '@newflow/design-system';
import { useNDVStore } from '@/stores/ndv.store';
import { DATA_STORE_NODES } from '@/constants';
import { useDataStoreStore } from '@/features/dataStore/dataStore.store';

const i18n = useI18n();
const nvdStore = useNDVStore();
const dataStoreStore = useDataStoreStore();

const calloutType = computed(() => {
	if (!DATA_STORE_NODES.includes(nvdStore.activeNode?.type ?? '')) {
		return null;
	}

	const sizeLimitState = dataStoreStore.dataStoreSizeLimitState;
	switch (sizeLimitState) {
		case 'error':
			return 'danger';
		case 'warn':
			return 'warning';
		default:
			return null;
	}
});
</script>
<template>
	<N8nCallout v-if="calloutType" :theme="calloutType" class="mt-xs">
		<span v-if="calloutType === 'danger'">
			{{
				i18n.baseText('dataStore.banner.storageLimitError.message', {
					interpolate: {
						usage: `${dataStoreStore.dataStoreSize} / ${dataStoreStore.maxSizeMB}MB`,
					},
				})
			}}
		</span>
		<span v-else>
			{{
				i18n.baseText('dataStore.banner.storageLimitWarning.message', {
					interpolate: {
						usage: `${dataStoreStore.dataStoreSize} / ${dataStoreStore.maxSizeMB}MB`,
					},
				})
			}}
		</span>
	</N8nCallout>
</template>
