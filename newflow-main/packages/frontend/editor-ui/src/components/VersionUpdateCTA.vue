<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { useVersionsStore } from '@/stores/versions.store';
import { N8nButton, N8nLink, N8nTooltip } from '@newflow/design-system';
import { useI18n } from '@newflow/i18n';
import { usePageRedirectionHelper } from '@/composables/usePageRedirectionHelper';
import { useUIStore } from '@/stores/ui.store';
import { useTelemetry } from '@/composables/useTelemetry';
import { VERSIONS_MODAL_KEY } from '@/constants';

interface Props {
	disabled?: boolean;
	tooltipText?: string;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	tooltipText: undefined,
});

const i18n = useI18n();
const versionsStore = useVersionsStore();
const uiStore = useUIStore();
const pageRedirectionHelper = usePageRedirectionHelper();
const telemetry = useTelemetry();

const openUpdatesPanel = () => {
	uiStore.openModal(VERSIONS_MODAL_KEY);
};

const onUpdateClick = async () => {
	telemetry.track('User clicked on update button', {
		source: 'main-sidebar',
	});

	await pageRedirectionHelper.goToVersions();
};
</script>

<template>
	<div :class="$style.container">
		<N8nLink
			size="small"
			theme="text"
			data-test-id="version-update-next-versions-link"
			@click="openUpdatesPanel"
		>
			{{
				i18n.baseText('whatsNew.versionsBehind', {
					interpolate: {
						count:
							versionsStore.nextVersions.length > 99 ? '99+' : versionsStore.nextVersions.length,
					},
				})
			}}
		</N8nLink>

		<N8nTooltip :disabled="!props.tooltipText" :content="props.tooltipText">
			<N8nButton
				:class="$style.button"
				:label="i18n.baseText('whatsNew.update')"
				data-test-id="version-update-cta-button"
				size="mini"
				:disabled="props.disabled"
				@click="onUpdateClick"
			/>
		</N8nTooltip>
	</div>
</template>

<style lang="scss" module>
.container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: var(--spacing-2xs);
	padding: var(--spacing-2xs) var(--spacing-xs);
	margin-left: var(--spacing-s);
	margin-bottom: var(--spacing-3xs);
	border-radius: var(--border-radius-base);
	border: var(--border-base);
	background: var(--color-background-light-base);
}

.button {
	width: 100%;
}
</style>
