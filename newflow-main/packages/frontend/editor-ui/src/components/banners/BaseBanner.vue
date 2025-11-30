<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useUIStore } from '@/stores/ui.store';
import { computed, useSlots } from 'vue';
import type { BannerName } from '@newflow/api-types';
import { useI18n } from '@newflow/i18n';
import type { CalloutTheme } from '@newflow/design-system';
import { type IconName } from '@newflow/design-system/components/N8nIcon/icons';

interface Props {
	name: BannerName;
	theme?: CalloutTheme;
	customIcon?: IconName;
	dismissible?: boolean;
}

const i18n = useI18n();

const uiStore = useUIStore();
const slots = useSlots();

const props = withDefaults(defineProps<Props>(), {
	theme: 'info',
	dismissible: true,
	customIcon: undefined,
});

const emit = defineEmits<{
	close: [];
}>();

const hasTrailingContent = computed(() => {
	return !!slots.trailingContent;
});

async function onCloseClick() {
	await uiStore.dismissBanner(props.name);
	emit('close');
}
</script>
<template>
	<n8n-callout
		:class="$style.callout"
		:theme="props.theme"
		:icon="props.customIcon"
		icon-size="medium"
		:round-corners="false"
		:data-test-id="`banners-${props.name}`"
		:only-bottom-border="true"
	>
		<div :class="[$style.mainContent, !hasTrailingContent ? $style.keepSpace : '']">
			<slot name="mainContent" />
		</div>
		<template #trailingContent>
			<div :class="$style.trailingContent">
				<slot name="trailingContent" />
				<n8n-icon
					v-if="dismissible"
					size="small"
					icon="x"
					:title="i18n.baseText('generic.dismiss')"
					class="clickable"
					:data-test-id="`banner-${props.name}-close`"
					@click="onCloseClick"
				/>
			</div>
		</template>
	</n8n-callout>
</template>

<style lang="scss" module>
.callout {
	height: calc(var(--header-height) * 1px);
}

.mainContent {
	display: flex;
	gap: var(--spacing-4xs);
}

.keepSpace {
	padding: 5px 0;
}
.trailingContent {
	display: flex;
	align-items: center;
	gap: var(--spacing-l);
}
</style>
