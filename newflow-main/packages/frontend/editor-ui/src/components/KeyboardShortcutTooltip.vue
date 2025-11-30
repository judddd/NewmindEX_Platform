<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import type { KeyboardShortcut } from '@/Interface';
import { N8nKeyboardShortcut, N8nTooltip } from '@newflow/design-system';
import type { Placement } from 'element-plus';

interface Props {
	label: string;
	shortcut?: KeyboardShortcut;
	placement?: Placement;
	disabled?: boolean;
}
withDefaults(defineProps<Props>(), { placement: 'top', shortcut: undefined });
</script>

<template>
	<N8nTooltip :placement="placement" :show-after="500" :disabled>
		<template #content>
			<div :class="$style.shortcut">
				<div :class="$style.label">{{ label }}</div>
				<N8nKeyboardShortcut v-if="shortcut" v-bind="shortcut" />
			</div>
		</template>
		<slot />
	</N8nTooltip>
</template>

<style lang="scss" module>
.shortcut {
	display: flex;
	align-items: center;
	font-size: var(--font-size-2xs);
	gap: var(--spacing-2xs);
}

.label {
	flex-shrink: 0;
}
</style>
