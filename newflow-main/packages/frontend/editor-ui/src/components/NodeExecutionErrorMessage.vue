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
	errorMessage?: string;
}>();
</script>

<template>
	<div>
		<span v-n8n-html="errorMessage" data-test-id="sanitized-error-message"></span>
		<br />
		<a data-action="openNodeDetail" :data-action-parameter-node="nodeName">{{
			i18n.baseText('node.executionError.openNode')
		}}</a>
	</div>
</template>
