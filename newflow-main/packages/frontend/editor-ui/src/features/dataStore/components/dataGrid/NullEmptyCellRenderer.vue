<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
const props = defineProps<{
	params: {
		value: string;
	};
}>();
</script>

<template>
	<span class="n8n-empty-value">{{ props.params.value }}</span>
</template>

<style lang="scss">
.n8n-empty-value {
	font-style: italic;
	color: var(--color-text-base);
}
</style>
