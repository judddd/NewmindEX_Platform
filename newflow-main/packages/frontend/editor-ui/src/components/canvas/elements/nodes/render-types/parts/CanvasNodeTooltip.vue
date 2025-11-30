<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useCanvasNode } from '@/composables/useCanvasNode';
import { computed } from 'vue';
import type { CanvasNodeDefaultRender } from '@/types';

defineProps<{
	visible: boolean;
}>();

const { render } = useCanvasNode();

const renderOptions = computed(() => render.value.options as CanvasNodeDefaultRender['options']);

const popperOptions = {
	modifiers: [
		{ name: 'flip', enabled: false }, // show tooltip always above the node
	],
};
</script>

<template>
	<N8nTooltip
		placement="top"
		:show-after="500"
		:visible="true"
		:teleported="false"
		:popper-class="$style.popper"
		:popper-options="popperOptions"
	>
		<template #content>
			{{ renderOptions.tooltip }}
		</template>
		<div :class="$style.tooltipTrigger" />
	</N8nTooltip>
</template>

<style lang="scss" module>
.tooltipTrigger {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.popper {
	white-space: nowrap;
}
</style>
