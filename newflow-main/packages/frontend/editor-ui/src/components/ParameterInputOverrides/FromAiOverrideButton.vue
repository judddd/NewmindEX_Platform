<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { useI18n } from '@newflow/i18n';

const i18n = useI18n();

const emit = defineEmits<{
	click: [];
}>();
</script>

<template>
	<N8nTooltip>
		<template #content>
			<div>{{ i18n.baseText('parameterOverride.applyOverrideButtonTooltip') }}</div>
		</template>

		<N8nButton
			:class="[$style.overrideButton]"
			type="tertiary"
			data-test-id="from-ai-override-button"
			@click="emit('click')"
		>
			<span>
				<!-- The span wrapping the icon centers it due to reliance on legacy behavior -->
				<AiStarsIcon size="large" />
			</span>
		</N8nButton>
	</N8nTooltip>
</template>

<style lang="scss" module>
.overrideButton {
	display: flex;
	justify-content: center;
	border: 0;
	height: 30px;
	width: 30px;
	background-color: var(--color-foreground-base);
	color: var(--color-foreground-xdark);

	&:hover {
		color: var(--color-foreground-xdark);
		background-color: var(--color-secondary);

		svg {
			// ensure enough contrast in both light and dark mode
			color: var(--p-gray-200);
		}
	}
}
</style>
