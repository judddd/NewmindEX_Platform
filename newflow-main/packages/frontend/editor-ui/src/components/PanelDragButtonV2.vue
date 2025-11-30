<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import Draggable from './Draggable.vue';
import type { XYPosition } from '@/Interface';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
	canMoveRight: boolean;
	canMoveLeft: boolean;
}>();

const emit = defineEmits<{
	drag: [e: XYPosition];
	dragstart: [];
	dragend: [];
}>();

const onDrag = (e: XYPosition) => {
	emit('drag', e);
};

const onDragEnd = () => {
	emit('dragend');
};

const onDragStart = () => {
	emit('dragstart');
};
</script>

<template>
	<Draggable
		:class="$style.dragContainer"
		type="panel-resize"
		cursor="ew-resize"
		data-test-id="panel-drag-button"
		@drag="onDrag"
		@dragstart="onDragStart"
		@dragend="onDragEnd"
	>
		<template #default="{ isDragging }">
			<button :class="[$style.dragButton, { [$style.dragging]: isDragging }]">
				<FontAwesomeIcon v-if="canMoveLeft" :class="$style.arrow" icon="arrow-left" />
				<FontAwesomeIcon :class="$style.handle" icon="bars" />
				<FontAwesomeIcon v-if="canMoveRight" :class="$style.arrow" icon="arrow-right" />
			</button>
		</template>
	</Draggable>
</template>

<style lang="scss" module>
.dragButton {
	cursor: ew-resize;
	border: none;
	outline: none;
	background: var(--color-background-xlight);

	display: flex;
	align-items: baseline;
	gap: var(--spacing-2xs);
	padding: var(--spacing-4xs) var(--spacing-2xs) var(--spacing-4xs) var(--spacing-2xs);
	color: var(--color-foreground-dark);
	border: var(--border-base);
	border-bottom: none;
	border-top-left-radius: var(--border-radius-base);
	border-top-right-radius: var(--border-radius-base);

	.arrow {
		opacity: 0;
		width: 7px;
	}

	.handle {
		width: 11px;
		transform: rotate(90deg);
	}

	&:hover,
	&.dragging {
		.arrow {
			opacity: 1;
		}
	}
}
</style>
