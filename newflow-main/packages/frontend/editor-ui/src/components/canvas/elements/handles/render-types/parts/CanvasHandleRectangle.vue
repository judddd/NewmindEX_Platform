<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
withDefaults(
	defineProps<{
		handleClasses?: string;
	}>(),
	{
		handleClasses: undefined,
	},
);
</script>

<template>
	<div :class="[$style.rectangle, handleClasses]" />
</template>

<style lang="scss" module>
.rectangle {
	width: var(--handle--indicator--width);
	height: var(--handle--indicator--height);
	background: var(--color-foreground-xdark);

	&:hover {
		background: var(--color-primary);
	}
}
</style>
