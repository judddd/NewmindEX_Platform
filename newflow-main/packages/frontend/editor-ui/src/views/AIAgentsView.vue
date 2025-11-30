<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@newflow/i18n';
import { N8nButton, N8nInput, N8nText, N8nCallout } from '@newflow/design-system';
import { useToast } from '@/composables/useToast';
import { useRootStore } from '@newflow/stores/useRootStore';
import { getChatAgents, type ChatAgent } from '@/api/chat-agents.api';
import { VIEWS } from '@/constants';

const i18n = useI18n();
const router = useRouter();
const rootStore = useRootStore();
const toast = useToast();

const agents = ref<ChatAgent[]>([]);
const searchQuery = ref('');
const isLoading = ref(false);

const filteredAgents = computed(() => {
	if (!searchQuery.value.trim()) {
		return agents.value;
	}
	const query = searchQuery.value.toLowerCase();
	return agents.value.filter(
		(agent) =>
			agent.name.toLowerCase().includes(query) || agent.description?.toLowerCase().includes(query),
	);
});

const hasAgents = computed(() => agents.value.length > 0);

async function loadAgents() {
	isLoading.value = true;
	try {
		const response = await getChatAgents(rootStore.restApiContext);
		agents.value = response.sort((a, b) => Number(b.isActive) - Number(a.isActive));
	} catch (error) {
		console.error('Failed to load agents:', error);
		toast.showError(error, i18n.baseText('aiAgents.loadError'));
	} finally {
		isLoading.value = false;
	}
}

function openAgentChat(agent: ChatAgent) {
	const fullUrl = `${window.location.origin}${agent.webhookUrl}`;
	window.open(fullUrl, '_blank', 'noopener,noreferrer');
}

function viewWorkflow(agent: ChatAgent) {
	router.push({ name: VIEWS.WORKFLOW, params: { name: agent.id } });
}

async function activateWorkflow(agent: ChatAgent) {
	try {
		// TODO: Implement workflow activation
		toast.showMessage({
			title: i18n.baseText('aiAgents.activationNotImplemented'),
			type: 'info',
		});
	} catch (error) {
		toast.showError(error, i18n.baseText('aiAgents.activationError'));
	}
}

onMounted(() => {
	loadAgents();
});
</script>

<template>
	<div :class="$style.container">
		<div :class="$style.header">
			<div :class="$style.titleSection">
				<N8nText tag="h1" size="2xlarge" :bold="true">
					{{ i18n.baseText('aiAgents.title') }}
				</N8nText>
				<N8nButton
					type="secondary"
					icon="refresh"
					size="small"
					:loading="isLoading"
					@click="loadAgents"
				>
					{{ i18n.baseText('aiAgents.refresh') }}
				</N8nButton>
			</div>
			<N8nInput
				v-model="searchQuery"
				:placeholder="i18n.baseText('aiAgents.search')"
				size="medium"
				:class="$style.search"
			>
				<template #prefix>
					<i class="fa fa-search" />
				</template>
			</N8nInput>
		</div>

		<div v-if="isLoading && !hasAgents" :class="$style.loading">
			<N8nText color="text-base">{{ i18n.baseText('aiAgents.loading') }}</N8nText>
		</div>

		<div v-else-if="!hasAgents" :class="$style.empty">
			<N8nCallout theme="secondary" icon="robot">
				{{ i18n.baseText('aiAgents.noAgents') }}
			</N8nCallout>
		</div>

		<div v-else-if="filteredAgents.length === 0" :class="$style.empty">
			<N8nCallout theme="secondary" icon="search">
				{{ i18n.baseText('aiAgents.noResults') }}
			</N8nCallout>
		</div>

		<div v-else :class="$style.agentsList">
			<div
				v-for="agent in filteredAgents"
				:key="agent.id"
				:class="[$style.agentCard, { [$style.inactive]: !agent.isActive }]"
			>
				<div :class="$style.agentHeader">
					<div :class="$style.agentTitle">
						<span :class="$style.statusIndicator" :title="agent.isActive ? 'Active' : 'Inactive'">
							{{ agent.isActive ? '🟢' : '⚪' }}
						</span>
						<N8nText tag="h3" size="large" :bold="true">
							{{ agent.name }}
						</N8nText>
					</div>
				</div>

				<div v-if="agent.description" :class="$style.agentDescription">
					<N8nText color="text-base" size="small">
						{{ agent.description }}
					</N8nText>
				</div>

				<div v-if="!agent.isActive" :class="$style.inactiveWarning">
					<N8nText color="text-base" size="small">
						⚠️ {{ i18n.baseText('aiAgents.inactive') }}
					</N8nText>
				</div>

				<div :class="$style.agentActions">
					<N8nButton
						v-if="agent.isActive"
						type="primary"
						size="small"
						icon="comments"
						@click="openAgentChat(agent)"
					>
						{{ i18n.baseText('aiAgents.openChat') }}
					</N8nButton>
					<N8nButton
						v-else
						type="primary"
						size="small"
						icon="power-off"
						@click="activateWorkflow(agent)"
					>
						{{ i18n.baseText('aiAgents.activate') }}
					</N8nButton>
					<N8nButton type="secondary" size="small" icon="eye" @click="viewWorkflow(agent)">
						{{ i18n.baseText('aiAgents.viewWorkflow') }}
					</N8nButton>
				</div>

				<div :class="$style.agentMeta">
					<N8nText color="text-light" size="xsmall">
						{{ i18n.baseText('aiAgents.webhookPath') }}: {{ agent.webhookUrl }}
					</N8nText>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: var(--spacing-l);
	background: var(--color-background-xlight);
	overflow: hidden;
}

.header {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-m);
	margin-bottom: var(--spacing-l);
}

.titleSection {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.search {
	max-width: 400px;
}

.loading,
.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
}

.agentsList {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: var(--spacing-m);
	overflow-y: auto;
	padding-right: var(--spacing-xs);
}

.agentCard {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-s);
	padding: var(--spacing-m);
	background: var(--color-background-base);
	border: 1px solid var(--color-foreground-base);
	border-radius: var(--border-radius-large);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary);
	}

	&.inactive {
		opacity: 0.8;
		border-color: var(--color-foreground-light);
	}
}

.agentHeader {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.agentTitle {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.statusIndicator {
	font-size: 12px;
	line-height: 1;
}

.agentDescription {
	margin-top: var(--spacing-xs);
}

.inactiveWarning {
	padding: var(--spacing-2xs) var(--spacing-xs);
	background: var(--color-warning-tint-2);
	border-radius: var(--border-radius-base);
}

.agentActions {
	display: flex;
	gap: var(--spacing-xs);
	margin-top: var(--spacing-xs);
}

.agentMeta {
	margin-top: var(--spacing-2xs);
	padding-top: var(--spacing-xs);
	border-top: 1px solid var(--color-foreground-light);
}
</style>
