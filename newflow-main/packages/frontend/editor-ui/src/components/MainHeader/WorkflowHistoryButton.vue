<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import { VIEWS } from '@/constants';
import { useI18n } from '@newflow/i18n';
import { I18nT } from 'vue-i18n';

const locale = useI18n();

const props = defineProps<{
	workflowId: string;
	isNewWorkflow: boolean;
	isFeatureEnabled: boolean;
}>();

const emit = defineEmits<{
	upgrade: [];
}>();

const workflowHistoryRoute = computed<{ name: string; params: { workflowId: string } }>(() => ({
	name: VIEWS.WORKFLOW_HISTORY,
	params: {
		workflowId: props.workflowId,
	},
}));
</script>

<template>
	<N8nTooltip placement="bottom">
		<RouterLink :to="workflowHistoryRoute">
			<N8nIconButton
				:disabled="isNewWorkflow || !isFeatureEnabled"
				data-test-id="workflow-history-button"
				type="highlight"
				icon="history"
				size="medium"
			/>
		</RouterLink>
		<template #content>
			<span v-if="isFeatureEnabled && isNewWorkflow">
				{{ locale.baseText('workflowHistory.button.tooltip.empty') }}
			</span>
			<span v-else-if="isFeatureEnabled">{{
				locale.baseText('workflowHistory.button.tooltip.enabled')
			}}</span>
			<I18nT v-else keypath="workflowHistory.button.tooltip.disabled" scope="global">
				<template #link>
					<N8nLink size="small" @click="emit('upgrade')">
						{{ locale.baseText('workflowHistory.button.tooltip.disabled.link') }}
					</N8nLink>
				</template>
			</I18nT>
		</template>
	</N8nTooltip>
</template>
