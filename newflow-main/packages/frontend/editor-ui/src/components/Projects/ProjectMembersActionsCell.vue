<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import type { ProjectMemberData } from '@/types/projects.types';
import type { UserAction } from '@newflow/design-system';

const props = defineProps<{
	data: ProjectMemberData;
	actions: Array<UserAction<ProjectMemberData>>;
}>();

const emit = defineEmits<{
	action: [value: { action: string; userId: string }];
}>();

const onAction = (action: string) => {
	emit('action', { action, userId: props.data.id });
};
</script>

<template>
	<N8nActionToggle
		v-if="props.actions.length > 0"
		placement="bottom"
		:actions="props.actions"
		theme="dark"
		@action="onAction"
	/>
</template>
