<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { N8nIconButton, N8nTooltip } from '@newflow/design-system';
import { useI18n } from '@newflow/i18n';

const i18n = useI18n();

const props = defineProps<{
	params: {
		onClick: () => void;
	};
}>();
</script>

<template>
	<N8nTooltip :content="i18n.baseText('dataStore.addRow.label')">
		<N8nIconButton text type="tertiary" icon="plus" @click="props.params.onClick" />
	</N8nTooltip>
</template>
