import { StatisticsNames, type WorkflowStatistics } from '@newflow/db';
import { WorkflowStatisticsRepository } from '@newflow/db';
import { Container } from '@newflow/di';
import type { Workflow } from 'n8n-workflow';

export async function createWorkflowStatisticsItem(
	workflowId: Workflow['id'],
	data?: Partial<WorkflowStatistics>,
) {
	const entity = Container.get(WorkflowStatisticsRepository).create({
		count: 0,
		latestEvent: new Date().toISOString(),
		name: StatisticsNames.manualSuccess,
		...(data ?? {}),
		workflowId,
	});

	// @ts-ignore CAT-957
	await Container.get(WorkflowStatisticsRepository).insert(entity);

	return entity;
}
