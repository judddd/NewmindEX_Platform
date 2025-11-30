<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import TitledList from '@/components/TitledList.vue';
import { useI18n } from '@newflow/i18n';
import { N8nTooltip, N8nIcon } from '@newflow/design-system';

defineProps<{
	issues: string[];
}>();

const i18n = useI18n();
</script>

<template>
	<div v-if="issues.length" :class="$style['parameter-issues']" data-test-id="parameter-issues">
		<N8nTooltip placement="top">
			<template #content>
				<TitledList :title="`${i18n.baseText('parameterInput.issues')}:`" :items="issues" />
			</template>
			<N8nIcon icon="triangle-alert" />
		</N8nTooltip>
	</div>
</template>

<style module lang="scss">
.parameter-issues {
	text-align: right;
	float: right;
	color: var(--color-danger-light);
	font-size: var(--font-size-s);
	padding-left: var(--spacing-3xs);
}
</style>
