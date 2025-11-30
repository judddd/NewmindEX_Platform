<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
import BaseBanner from '@/components/banners/BaseBanner.vue';
import { useDataStoreStore } from '@/features/dataStore/dataStore.store';

const dataStoreStore = useDataStoreStore();
const i18n = useI18n();
</script>

<template>
	<BaseBanner name="DATA_STORE_STORAGE_LIMIT_WARNING" :dismissible="true" theme="warning">
		<template #mainContent>
			<span>{{
				i18n.baseText('dataStore.banner.storageLimitWarning.message', {
					interpolate: {
						usage: `${dataStoreStore.dataStoreSize} / ${dataStoreStore.maxSizeMB}MB`,
					},
				})
			}}</span>
		</template>
	</BaseBanner>
</template>
