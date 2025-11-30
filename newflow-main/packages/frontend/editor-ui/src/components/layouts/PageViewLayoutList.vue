<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
interface Props {
	overflow?: boolean;
}

defineProps<Props>();
</script>

<template>
	<div :class="{ [$style.wrapper]: true, [$style.overflow]: overflow }">
		<div :class="$style.list">
			<div v-if="$slots.header" :class="$style.header">
				<slot name="header" />
			</div>
			<div :class="$style.body">
				<slot />
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
.wrapper {
	display: grid;
	height: 100%;
}

.overflow {
	.list {
		.body {
			overflow: auto;
		}
	}
}

.list {
	display: grid;
	grid-template-rows: auto 1fr;
	height: 100%;
	.body {
		position: relative;
		height: 100%;
	}
}
</style>
