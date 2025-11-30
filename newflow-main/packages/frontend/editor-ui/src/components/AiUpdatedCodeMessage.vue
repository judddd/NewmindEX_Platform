<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
const i18n = useI18n();

defineProps<{
	nodeName: string;
}>();
</script>

<template>
	<div>
		{{ i18n.baseText('aiAssistant.codeUpdated.message.body1') }}
		<a data-action="openNodeDetail" :data-action-parameter-node="nodeName">{{ nodeName }}</a>
		{{ i18n.baseText('aiAssistant.codeUpdated.message.body2') }}
	</div>
</template>
