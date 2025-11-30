<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useContextMenu } from '@/composables/useContextMenu';
import { type ContextMenuAction } from '@/composables/useContextMenuItems';
import { useStyles } from '@/composables/useStyles';
import { N8nActionDropdown } from '@newflow/design-system';
import { ref, watch } from 'vue';
import { type ComponentExposed } from 'vue-component-type-helpers';

const contextMenu = useContextMenu();
const { position, isOpen, actions, target } = contextMenu;
const dropdown = ref<ComponentExposed<typeof N8nActionDropdown>>();
const emit = defineEmits<{ action: [action: ContextMenuAction, nodeIds: string[]] }>();
const { APP_Z_INDEXES } = useStyles();

watch(
	isOpen,
	() => {
		if (isOpen) {
			dropdown.value?.open();
		} else {
			dropdown.value?.close();
		}
	},
	{ flush: 'post' },
);

function onActionSelect(item: ContextMenuAction) {
	emit('action', item, contextMenu.targetNodeIds.value);
}

function onVisibleChange(open: boolean) {
	if (!open) {
		contextMenu.close();
	}
}
</script>

<template>
	<Teleport v-if="isOpen" to="body">
		<div
			:class="$style.contextMenu"
			:style="{
				left: `${position[0]}px`,
				top: `${position[1]}px`,
				zIndex: APP_Z_INDEXES.CONTEXT_MENU,
			}"
		>
			<N8nActionDropdown
				ref="dropdown"
				:items="actions"
				placement="bottom-start"
				data-test-id="context-menu"
				:hide-arrow="target?.source !== 'node-button'"
				:teleported="false"
				@select="onActionSelect"
				@visible-change="onVisibleChange"
			>
				<template #activator>
					<div :class="$style.activator"></div>
				</template>
			</N8nActionDropdown>
		</div>
	</Teleport>
</template>

<style module lang="scss">
.contextMenu {
	position: fixed;
}

.activator {
	pointer-events: none;
	opacity: 0;
}
</style>
