<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup="">
import type { UsersList } from '@newflow/api-types';
import type { UserAction } from '@newflow/design-system';
import type { IUser } from '@newflow/rest-api-client/api/users';

const props = defineProps<{
	data: UsersList['items'][number];
	actions: Array<UserAction<IUser>>;
}>();

const emit = defineEmits<{
	action: [value: { action: string; userId: string }];
}>();

const onUserAction = (action: string) => {
	emit('action', {
		action,
		userId: props.data.id,
	});
};
</script>

<template>
	<div>
		<N8nActionToggle
			v-if="props.data.signInType !== 'ldap' && props.actions.length > 0"
			placement="bottom"
			:actions="props.actions"
			theme="dark"
			@action="onUserAction"
		/>
	</div>
</template>
