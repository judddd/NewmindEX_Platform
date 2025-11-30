/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { computed } from 'vue';
import { defineStore } from 'pinia';
import { saveAs } from 'file-saver';
import type { IWorkflowDb } from '@/Interface';
import type { WorkflowDataUpdate } from '@newflow/rest-api-client/api/workflows';
import type {
	WorkflowHistory,
	WorkflowVersion,
	WorkflowHistoryRequestParams,
	WorkflowVersionId,
} from '@newflow/rest-api-client/api/workflowHistory';
import * as whApi from '@newflow/rest-api-client/api/workflowHistory';
import { useRootStore } from '@newflow/stores/useRootStore';
import { useSettingsStore } from '@/stores/settings.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import { getNewWorkflow } from '@/api/workflows';

export const useWorkflowHistoryStore = defineStore('workflowHistory', () => {
	const rootStore = useRootStore();
	const settingsStore = useSettingsStore();
	const workflowsStore = useWorkflowsStore();

	const pruneTime = computed(() => settingsStore.settings.workflowHistory.pruneTime ?? -1);
	const evaluatedPruneTime = computed(() => pruneTime.value);
	const shouldUpgrade = computed(() => false); // No longer need to upgrade - license checks removed

	const getWorkflowHistory = async (
		workflowId: string,
		queryParams: WorkflowHistoryRequestParams,
	): Promise<WorkflowHistory[]> =>
		await whApi.getWorkflowHistory(rootStore.restApiContext, workflowId, queryParams);

	const getWorkflowVersion = async (
		workflowId: string,
		versionId: string,
	): Promise<WorkflowVersion> =>
		await whApi.getWorkflowVersion(rootStore.restApiContext, workflowId, versionId);

	const downloadVersion = async (
		workflowId: string,
		workflowVersionId: WorkflowVersionId,
		data: { formattedCreatedAt: string },
	) => {
		const [workflow, workflowVersion] = await Promise.all([
			workflowsStore.fetchWorkflow(workflowId),
			getWorkflowVersion(workflowId, workflowVersionId),
		]);
		const { connections, nodes } = workflowVersion;
		const blob = new Blob([JSON.stringify({ ...workflow, nodes, connections }, null, 2)], {
			type: 'application/json;charset=utf-8',
		});
		saveAs(blob, `${workflow.name}(${data.formattedCreatedAt}).json`);
	};

	const cloneIntoNewWorkflow = async (
		workflowId: string,
		workflowVersionId: string,
		data: { formattedCreatedAt: string },
	): Promise<IWorkflowDb> => {
		const [workflow, workflowVersion] = await Promise.all([
			workflowsStore.fetchWorkflow(workflowId),
			getWorkflowVersion(workflowId, workflowVersionId),
		]);
		const { connections, nodes } = workflowVersion;
		const { name } = workflow;
		const newWorkflow = await getNewWorkflow(rootStore.restApiContext, {
			name: `${name} (${data.formattedCreatedAt})`,
		});
		const newWorkflowData: WorkflowDataUpdate = {
			nodes,
			connections,
			name: newWorkflow.name,
		};
		return await workflowsStore.createNewWorkflow(newWorkflowData);
	};

	const restoreWorkflow = async (
		workflowId: string,
		workflowVersionId: string,
		shouldDeactivate: boolean,
	): Promise<IWorkflowDb> => {
		const workflowVersion = await getWorkflowVersion(workflowId, workflowVersionId);
		const { connections, nodes } = workflowVersion;
		const updateData: WorkflowDataUpdate = { connections, nodes };

		if (shouldDeactivate) {
			updateData.active = false;
		}

		return await workflowsStore
			.updateWorkflow(workflowId, updateData, true)
			.catch(async (error) => {
				if (
					error.httpStatusCode === 400 &&
					typeof error.message === 'string' &&
					error.message.includes('can not be activated')
				) {
					return await workflowsStore.fetchWorkflow(workflowId);
				} else {
					throw new Error(error);
				}
			});
	};

	return {
		getWorkflowHistory,
		getWorkflowVersion,
		downloadVersion,
		cloneIntoNewWorkflow,
		restoreWorkflow,
		evaluatedPruneTime,
		shouldUpgrade,
	};
});
