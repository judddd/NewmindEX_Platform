<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import type { CanvasEdgeProps } from '@/components/canvas/elements/edges/CanvasEdge.vue';
import Edge from '@/components/canvas/elements/edges/CanvasEdge.vue';
import { BaseEdge } from '@vue-flow/core';

const props = defineProps<CanvasEdgeProps>();
</script>

<template>
	<Edge v-bind="props" read-only :selected="false" :selectable="false">
		<template #highlight="{ segments }">
			<BaseEdge
				v-for="segment in segments"
				:key="segment[0]"
				:style="{
					strokeWidth: 15,
					stroke: 'var(--edge-highlight-color)',
				}"
				:path="segment[0]"
				:interaction-width="0"
			/>
		</template>
	</Edge>
</template>
