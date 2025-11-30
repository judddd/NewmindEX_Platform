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
	items: string[];
}>();
</script>

<template>
	<div class="titled-list">
		<p v-text="title" />
		<ul>
			<li v-for="item in items" :key="item" v-n8n-html="item" class="titled-list-item" />
		</ul>
	</div>
</template>

<style lang="scss" scoped>
.titled-list {
	display: flex;
	flex-direction: column;

	.titled-list-item {
		list-style: none;
		padding-left: var(--spacing-3xs);
		&::before {
			content: '- ';
		}
	}
}
</style>
