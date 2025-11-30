<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { computed } from 'vue';
import { shorten } from '@/utils/typesUtils';

const DEFAULT_WORKFLOW_NAME_LIMIT = 25;
const WORKFLOW_NAME_END_COUNT_TO_KEEP = 4;

interface Props {
	name: string;
	testId: string;
	limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
	limit: DEFAULT_WORKFLOW_NAME_LIMIT,
});

const shortenedName = computed(() =>
	shorten(props.name, props.limit, WORKFLOW_NAME_END_COUNT_TO_KEEP),
);
</script>

<template>
	<span :title="name" :data-test-id="testId">
		<slot :shortened-name="shortenedName"></slot>
	</span>
</template>
