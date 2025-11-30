<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts">
export default {
	props: ['text', 'type'],
};
</script>

<template>
	<el-tag
		v-if="type === 'danger'"
		type="danger"
		size="small"
		:class="$style['danger']"
		:disable-transitions="true"
	>
		{{ text }}
	</el-tag>
	<el-tag
		v-else-if="type === 'warning'"
		size="small"
		:class="$style['warning']"
		:disable-transitions="true"
	>
		{{ text }}
	</el-tag>
</template>

<style lang="scss" module>
.badge {
	font-size: 11px;
	line-height: 18px;
	max-height: 18px;
	font-weight: var(--font-weight-regular);
	display: flex;
	align-items: center;
	padding: 2px 4px;
}

.danger {
	composes: badge;
	color: $badge-danger-color;
	background-color: $badge-danger-background-color;
	border-color: $badge-danger-border-color;
}

.warning {
	composes: badge;
	background-color: $badge-warning-background-color;
	color: $badge-warning-color;
	border: none;
}
</style>
