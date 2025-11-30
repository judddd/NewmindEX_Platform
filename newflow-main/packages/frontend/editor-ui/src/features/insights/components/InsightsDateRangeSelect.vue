<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { useInsightsStore } from '@/features/insights/insights.store';
import type { InsightsDateRange } from '@newflow/api-types';
import { N8nOption, N8nSelect } from '@newflow/design-system';
import { ref } from 'vue';
import { getTimeRangeLabels } from '../insights.utils';

const model = defineModel<InsightsDateRange['key']>({
	required: true,
});

const insightsStore = useInsightsStore();

const timeRangeLabels = getTimeRangeLabels();

// All time ranges are now available - license restrictions removed
const timeOptions = ref(
	insightsStore.dateRanges.map((option) => {
		return {
			key: option.key,
			label: timeRangeLabels[option.key],
			value: option.key,
		};
	}),
);
</script>

<template>
	<N8nSelect v-model="model" size="small">
		<N8nOption v-for="item in timeOptions" :key="item.key" :value="item.value" :label="item.label">
			{{ item.label }}
		</N8nOption>
	</N8nSelect>
</template>
