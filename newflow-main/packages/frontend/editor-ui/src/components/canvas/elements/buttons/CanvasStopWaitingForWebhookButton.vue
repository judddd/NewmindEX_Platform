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
</script>
<template>
	<N8nIconButton
		class="stop-execution"
		icon="square"
		size="large"
		:title="i18n.baseText('nodeView.stopWaitingForWebhookCall')"
		type="secondary"
		data-test-id="stop-execution-waiting-for-webhook-button"
	/>
</template>
