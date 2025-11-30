<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import GoBackButton from '@/components/GoBackButton.vue';

interface Props {
	goBackEnabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	goBackEnabled: false,
});
</script>

<template>
	<div :class="$style.template">
		<div :class="$style.container">
			<div :class="$style.header">
				<div v-if="goBackEnabled" :class="$style.goBack">
					<GoBackButton />
				</div>
				<slot name="header"></slot>
			</div>
			<div>
				<slot name="content"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
.template {
	display: flex;
	width: 100%;
	max-width: var(--content-container-width);
	padding: var(--spacing-l) var(--spacing-l) 0;
	justify-content: center;
	@media (min-width: 1200px) {
		padding: var(--spacing-2xl) var(--spacing-2xl) 0;
	}
}

.container {
	width: 100%;
}

.header {
	display: flex;
	flex-direction: column;
	margin-bottom: var(--spacing-2xl);
}

.goBack {
	margin-bottom: var(--spacing-2xs);
}
</style>
