/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { Config, Env } from '../decorators';

const callerPolicySchema = z.enum(['any', 'none', 'workflowsFromAList', 'workflowsFromSameOwner']);
type CallerPolicy = z.infer<typeof callerPolicySchema>;

@Config
export class WorkflowsConfig {
	/** Default name for workflow */
	@Env('WORKFLOWS_DEFAULT_NAME')
	defaultName: string = 'My workflow';

	/** Default option for which workflows may call the current workflow */
	@Env('NEWFLOW_WORKFLOW_CALLER_POLICY_DEFAULT_OPTION', callerPolicySchema)
	callerPolicyDefaultOption: CallerPolicy = 'workflowsFromSameOwner';

	/** How many workflows to activate simultaneously during startup. */
	@Env('NEWFLOW_WORKFLOW_ACTIVATION_BATCH_SIZE')
	activationBatchSize: number = 1;
}
