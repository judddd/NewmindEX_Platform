<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { type ButtonProps } from '@newflow/design-system';

export type Props = Pick<ButtonProps, 'label' | 'type'>;

defineProps<Props>();
</script>
<template>
	<N8nButton
		:label="label"
		size="large"
		icon="message-circle"
		:type="type"
		data-test-id="workflow-chat-button"
	/>
</template>
