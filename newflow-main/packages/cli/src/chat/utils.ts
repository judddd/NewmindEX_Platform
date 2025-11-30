/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IExecutionResponse } from '@newflow/db';
import type { INode } from 'n8n-workflow';
import { CHAT_WAIT_USER_REPLY, RESPOND_TO_WEBHOOK_NODE_TYPE } from 'n8n-workflow';

/**
 * Returns the message to be sent of the last executed node
 */
export function getMessage(execution: IExecutionResponse) {
	const lastNodeExecuted = execution.data.resultData.lastNodeExecuted;
	if (typeof lastNodeExecuted !== 'string') return undefined;

	const runIndex = execution.data.resultData.runData[lastNodeExecuted].length - 1;
	const nodeExecutionData =
		execution.data.resultData.runData[lastNodeExecuted][runIndex]?.data?.main?.[0];
	return nodeExecutionData?.[0] ? nodeExecutionData[0].sendMessage : undefined;
}

/**
 * Returns the last node executed
 */
export function getLastNodeExecuted(execution: IExecutionResponse) {
	const lastNodeExecuted = execution.data.resultData.lastNodeExecuted;
	if (typeof lastNodeExecuted !== 'string') return undefined;
	return execution.workflowData?.nodes?.find((node) => node.name === lastNodeExecuted);
}

/**
 * Check if execution should be resumed immediately after receivng a message
 */
export function shouldResumeImmediately(lastNode: INode) {
	if (lastNode?.type === RESPOND_TO_WEBHOOK_NODE_TYPE) {
		return true;
	}

	if (lastNode?.parameters?.[CHAT_WAIT_USER_REPLY] === false) {
		return true;
	}

	const options = lastNode?.parameters?.options as {
		[CHAT_WAIT_USER_REPLY]?: boolean;
	};

	if (options && options[CHAT_WAIT_USER_REPLY] === false) {
		return true;
	}

	return false;
}
