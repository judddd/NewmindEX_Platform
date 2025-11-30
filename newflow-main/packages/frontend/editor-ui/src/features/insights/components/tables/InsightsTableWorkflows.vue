<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup="">
import { useI18n } from '@newflow/i18n';
import { INSIGHTS_UNIT_MAPPING } from '@/features/insights/insights.constants';
import {
	transformInsightsAverageRunTime,
	transformInsightsFailureRate,
	transformInsightsTimeSaved,
} from '@/features/insights/insights.utils';
import type { InsightsByWorkflow } from '@newflow/api-types';
import { N8nTooltip, N8nDataTableServer } from '@newflow/design-system';
import type { TableHeader } from '@newflow/design-system/components/N8nDataTableServer';
import { smartDecimal } from '@newflow/utils/number/smartDecimal';
import { useTelemetry } from '@/composables/useTelemetry';
import { VIEWS } from '@/constants';
import { computed, ref, watch } from 'vue';
import { type RouteLocationRaw, type LocationQueryRaw } from 'vue-router';

// InsightsPaywall component removed - feature is now fully available

const props = defineProps<{
	data: InsightsByWorkflow;
	loading?: boolean;
	isDashboardEnabled?: boolean;
}>();

const i18n = useI18n();
const telemetry = useTelemetry();

type Item = InsightsByWorkflow['data'][number];

const sampleWorkflows: InsightsByWorkflow['data'] = Array.from({ length: 10 }, (_, i) => ({
	workflowId: `sample-workflow-${i + 1}`,
	workflowName: `Sample Workflow ${i + 1}`,
	total: Math.floor(Math.random() * 2000) + 500,
	failed: Math.floor(Math.random() * 100) + 20,
	failureRate: Math.random() * 100,
	timeSaved: Math.floor(Math.random() * 300000) + 60000,
	averageRunTime: Math.floor(Math.random() * 60000) + 15000,
	projectName: `Sample Project ${i + 1}`,
	projectId: `sample-project-${i + 1}`,
	succeeded: Math.floor(Math.random() * 2000) + 500,
	runTime: Math.floor(Math.random() * 60000) + 15000,
}));

// Sample data removed - dashboard always uses real data now
const tableData = computed(() => props.data);
const rows = computed(() => tableData.value.data);

// All columns now sortable - license restrictions removed
const headers = ref<Array<TableHeader<Item>>>([
	{
		title: 'Name',
		key: 'workflowName',
		width: 400,
	},
	{
		title: i18n.baseText('insights.banner.title.total'),
		key: 'total',
		value(row) {
			return row.total.toLocaleString('en-US');
		},
	},
	{
		title: i18n.baseText('insights.banner.title.failed'),
		key: 'failed',
		value(row) {
			return row.failed.toLocaleString('en-US');
		},
	},
	{
		title: i18n.baseText('insights.banner.title.failureRate'),
		key: 'failureRate',
		value(row) {
			return (
				smartDecimal(transformInsightsFailureRate(row.failureRate)) +
				INSIGHTS_UNIT_MAPPING.failureRate(row.failureRate)
			);
		},
	},
	{
		title: i18n.baseText('insights.banner.title.timeSaved'),
		key: 'timeSaved',
		value(row) {
			return (
				smartDecimal(transformInsightsTimeSaved(row.timeSaved)) +
				INSIGHTS_UNIT_MAPPING.timeSaved(row.timeSaved)
			);
		},
	},
	{
		title: i18n.baseText('insights.banner.title.averageRunTime'),
		key: 'averageRunTime',
		value(row) {
			return (
				smartDecimal(transformInsightsAverageRunTime(row.averageRunTime)) +
				INSIGHTS_UNIT_MAPPING.averageRunTime(row.averageRunTime)
			);
		},
	},
	{
		title: i18n.baseText('insights.dashboard.table.projectName'),
		key: 'projectName',
		disableSort: true,
	},
]);

const sortBy = defineModel<Array<{ id: string; desc: boolean }>>('sortBy');
const currentPage = ref(0);
const itemsPerPage = ref(25);

const emit = defineEmits<{
	'update:options': [
		payload: {
			page: number;
			itemsPerPage: number;
			sortBy: Array<{ id: string; desc: boolean }>;
		},
	];
}>();

const getWorkflowLink = (item: Item, query?: LocationQueryRaw): RouteLocationRaw => ({
	name: VIEWS.WORKFLOW,
	params: {
		name: item.workflowId,
	},
	query,
});

const trackWorkflowClick = (item: Item) => {
	telemetry.track('User clicked on workflow from insights table', {
		workflow_id: item.workflowId,
	});
};

watch(sortBy, (newValue) => {
	telemetry.track('User sorted insights table', {
		sorted_by: (newValue ?? []).map((item) => ({
			...item,
			label: headers.value.find((header) => header.key === item.id)?.title,
		})),
	});
});
</script>

<template>
	<div>
		<N8nHeading bold tag="h3" size="medium" class="mb-s">{{
			i18n.baseText('insights.dashboard.table.title')
		}}</N8nHeading>
		<N8nDataTableServer
			v-model:sort-by="sortBy"
			v-model:page="currentPage"
			v-model:items-per-page="itemsPerPage"
			:items="rows"
			:headers="headers"
			:items-length="tableData.count"
			@update:options="emit('update:options', $event)"
		>
			<template #[`item.workflowName`]="{ item }">
				<component
					:is="item.workflowId ? 'router-link' : 'div'"
					v-bind="
						item.workflowId
							? {
									to: getWorkflowLink(item),
									class: $style.link,
									onClick: () => trackWorkflowClick(item),
								}
							: {}
					"
				>
					<N8nTooltip :content="item.workflowName" placement="top">
						<div :class="$style.ellipsis">
							{{ item.workflowName }}
						</div>
					</N8nTooltip>
				</component>
			</template>
			<template #[`item.timeSaved`]="{ item, value }">
				<router-link
					v-if="!item.timeSaved && item.workflowId"
					:to="getWorkflowLink(item, { settings: 'true' })"
					:class="$style.link"
				>
					{{ i18n.baseText('insights.dashboard.table.estimate') }}
				</router-link>
				<template v-else>
					{{ value }}
				</template>
			</template>
			<template #[`item.projectName`]="{ item }">
				<N8nTooltip v-if="item.projectName" :content="item.projectName" placement="top">
					<div :class="$style.ellipsis">
						{{ item.projectName }}
					</div>
				</N8nTooltip>
				<template v-else> - </template>
			</template>
			<!-- InsightsPaywall cover removed - all features now available -->
		</N8nDataTableServer>
	</div>
</template>

<style lang="scss" module>
.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.2;
	width: fit-content;
	max-width: 100%;
}

.link {
	display: inline-flex;
	height: 100%;
	align-items: center;
	color: var(--color-text-base);
	text-decoration: underline;
	max-width: 100%;
	&:hover {
		color: var(--color-text-dark);
	}
}

.blurryCover {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1;
	backdrop-filter: blur(10px);

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-foreground-xlight);
		opacity: 0.5;
		z-index: -1;
	}
}
</style>
