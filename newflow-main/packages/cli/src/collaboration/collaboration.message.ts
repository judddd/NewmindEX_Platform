/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

export type CollaborationMessage = WorkflowOpenedMessage | WorkflowClosedMessage;

export const workflowOpenedMessageSchema = z
	.object({
		type: z.literal('workflowOpened'),
		workflowId: z.string().min(1),
	})
	.strict();

export const workflowClosedMessageSchema = z
	.object({
		type: z.literal('workflowClosed'),
		workflowId: z.string().min(1),
	})
	.strict();

export const workflowMessageSchema = z.discriminatedUnion('type', [
	workflowOpenedMessageSchema,
	workflowClosedMessageSchema,
]);

export type WorkflowOpenedMessage = z.infer<typeof workflowOpenedMessageSchema>;

export type WorkflowClosedMessage = z.infer<typeof workflowClosedMessageSchema>;

export type WorkflowMessage = z.infer<typeof workflowMessageSchema>;

/**
 * Parses the given message and ensure it's of type WorkflowMessage
 */
export const parseWorkflowMessage = async (msg: unknown) => {
	return await workflowMessageSchema.parseAsync(msg);
};
