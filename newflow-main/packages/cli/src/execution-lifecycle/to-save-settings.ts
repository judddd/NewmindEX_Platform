/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { GlobalConfig } from '@newflow/config';
import { Container } from '@newflow/di';
import type { IWorkflowSettings } from 'n8n-workflow';

export type ExecutionSaveSettings = {
	error: boolean | 'all' | 'none';
	success: boolean | 'all' | 'none';
	manual: boolean;
	progress: boolean;
};

/**
 * Return whether a workflow execution is configured to be saved or not:
 *
 * - `error`: Whether to save failed executions in production.
 * - `success`: Whether to successful executions in production.
 * - `manual`: Whether to save successful or failed manual executions.
 * - `progress`: Whether to save execution progress, i.e. after each node's execution.
 */
export function toSaveSettings(
	workflowSettings: IWorkflowSettings | null = {},
): ExecutionSaveSettings {
	const DEFAULTS = {
		ERROR: Container.get(GlobalConfig).executions.saveDataOnError,
		SUCCESS: Container.get(GlobalConfig).executions.saveDataOnSuccess,
		MANUAL: Container.get(GlobalConfig).executions.saveDataManualExecutions,
		PROGRESS: Container.get(GlobalConfig).executions.saveExecutionProgress,
	};

	const {
		saveDataErrorExecution = DEFAULTS.ERROR,
		saveDataSuccessExecution = DEFAULTS.SUCCESS,
		saveManualExecutions = DEFAULTS.MANUAL,
		saveExecutionProgress = DEFAULTS.PROGRESS,
	} = workflowSettings ?? {};

	return {
		error: saveDataErrorExecution === 'DEFAULT' ? DEFAULTS.ERROR : saveDataErrorExecution === 'all',
		success:
			saveDataSuccessExecution === 'DEFAULT'
				? DEFAULTS.SUCCESS
				: saveDataSuccessExecution === 'all',
		manual: saveManualExecutions === 'DEFAULT' ? DEFAULTS.MANUAL : saveManualExecutions,
		progress: saveExecutionProgress === 'DEFAULT' ? DEFAULTS.PROGRESS : saveExecutionProgress,
	};
}
