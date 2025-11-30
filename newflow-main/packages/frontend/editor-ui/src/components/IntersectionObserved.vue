<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { EventBus } from '@newflow/utils/event-bus';
import { createEventBus } from '@newflow/utils/event-bus';

const props = withDefaults(
	defineProps<{
		enabled: boolean;
		eventBus: EventBus;
	}>(),
	{
		enabled: false,
		default: () => createEventBus(),
	},
);

const observed = ref<IntersectionObserver | null>(null);

onMounted(async () => {
	if (!props.enabled) {
		return;
	}

	await nextTick();

	props.eventBus.emit('observe', observed.value);
});

onBeforeUnmount(() => {
	if (props.enabled) {
		props.eventBus.emit('unobserve', observed.value);
	}
});
</script>

<template>
	<span ref="observed">
		<slot></slot>
	</span>
</template>
