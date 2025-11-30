<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useUsageStore } from '@/stores/usage.store';
import { i18n as locale } from '@newflow/i18n';
import { useToast } from '@/composables/useToast';
import { useDocumentTitle } from '@/composables/useDocumentTitle';
import N8nInfoTip from '@newflow/design-system/components/N8nInfoTip';

const usageStore = useUsageStore();
const toast = useToast();
const documentTitle = useDocumentTitle();

// All license-related features removed - this page now only shows usage statistics

onMounted(async () => {
	documentTitle.set('Usage Statistics');
	usageStore.setLoading(true);
	try {
		await usageStore.getLicenseInfo();
		usageStore.setLoading(false);
	} catch (error) {
		if (!error.name) {
			error.name = 'Error loading usage data';
		}
		toast.showError(error, error.name, error.message);
	}
});
</script>

<template>
	<div class="settings-usage-and-plan">
		<!-- License-related content removed - now showing only usage statistics -->
		<n8n-heading tag="h2" size="2xlarge">Usage Statistics</n8n-heading>

		<div v-if="!usageStore.isLoading">
			<div :class="$style.quota">
				<n8n-text size="medium" color="text-light"> Active Workflows </n8n-text>
				<div :class="$style.chart">
					<span v-if="usageStore.activeWorkflowTriggersLimit > 0" :class="$style.chartLine">
						<span
							:class="$style.chartBar"
							:style="{ width: `${usageStore.executionPercentage}%` }"
						></span>
					</span>
					<span :class="$style.count">
						{{ usageStore.activeWorkflowTriggersCount }}
						<span v-if="usageStore.activeWorkflowTriggersLimit < 0"> / Unlimited</span>
						<span v-else> / {{ usageStore.activeWorkflowTriggersLimit }}</span>
					</span>
				</div>
			</div>

			<N8nInfoTip>Active workflows with multiple triggers count multiple times</N8nInfoTip>
		</div>
	</div>
</template>

<style lang="scss" module>
@use '@/styles/variables' as *;

.center > div {
	justify-content: center;
}

.actionBox {
	margin: var(--spacing-2xl) 0 0;
}

.spacedFlex {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title {
	display: flex;
	align-items: center;
	padding: var(--spacing-2xl) 0 var(--spacing-m);
}

.quota {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 54px;
	padding: 0 var(--spacing-s);
	margin: 0 0 var(--spacing-xs);
	background: var(--color-background-xlight);
	border-radius: var(--border-radius-large);
	border: 1px solid var(--color-foreground-base);
	white-space: nowrap;

	.count {
		text-transform: lowercase;
		font-size: var(--font-size-s);
	}
}

.buttons {
	display: flex;
	justify-content: flex-end;
	padding: var(--spacing-xl) 0 0;

	button {
		margin-left: var(--spacing-xs);

		a {
			display: inline-block;
			color: inherit;
			text-decoration: none;
			padding: var(--spacing-xs) var(--spacing-m);
			margin: calc(var(--spacing-xs) * -1) calc(var(--spacing-m) * -1);
		}
	}
}

.chart {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-grow: 1;
}

.chartLine {
	display: block;
	height: 10px;
	width: 100%;
	max-width: 260px;
	margin: 0 var(--spacing-m);
	border-radius: 10px;
	background: var(--color-background-base);
}

.chartBar {
	float: left;
	height: 100%;
	max-width: 100%;
	background: var(--color-secondary);
	border-radius: 10px;
	transition: width 0.2s $ease-out-expo;
}

div[class*='info'] > span > span:last-child {
	line-height: 1.4;
	padding: 0 0 0 var(--spacing-4xs);
}

.titleTooltip {
	display: flex;
	align-items: center;
	margin: 0 0 0 var(--spacing-2xs);
}
</style>

<style lang="scss" scoped>
.settings-usage-and-plan {
	:deep(.el-dialog__wrapper) {
		display: flex;
		align-items: center;
		justify-content: center;

		.el-dialog {
			margin: 0;

			.el-dialog__footer {
				button {
					margin-left: var(--spacing-xs);
				}
			}
		}
	}
}
</style>
