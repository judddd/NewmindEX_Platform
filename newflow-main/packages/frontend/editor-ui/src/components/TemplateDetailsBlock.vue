<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
defineProps<{
	title: string;
}>();
</script>

<template>
	<div :class="$style.block">
		<div :class="$style.header">
			<n8n-heading tag="h3" size="small" color="text-base">{{ title }}</n8n-heading>
		</div>
		<div :class="$style.content">
			<slot></slot>
		</div>
	</div>
</template>

<style lang="scss" module>
.block {
	padding-bottom: var(--spacing-xl);
}

.header {
	padding: 0 0 var(--spacing-4xs);
	border-bottom: var(--border-base);
}

.content {
	padding: var(--spacing-xs) 0 0;
}
</style>
