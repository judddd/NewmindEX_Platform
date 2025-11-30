<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
import { computed } from 'vue';

defineProps<{
	isBuildMode: boolean;
}>();

const emit = defineEmits<{
	toggle: [value: boolean];
}>();

const i18n = useI18n();

const options = computed(() => [
	{ label: i18n.baseText('aiAssistant.tabs.ask'), value: false },
	{ label: i18n.baseText('aiAssistant.tabs.build'), value: true },
]);

function toggle(value: boolean) {
	emit('toggle', value);
}
</script>

<template>
	<n8n-radio-buttons
		size="small"
		:model-value="isBuildMode"
		:options="options"
		@update:model-value="toggle"
	/>
</template>
