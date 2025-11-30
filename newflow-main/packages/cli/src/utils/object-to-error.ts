/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { isObjectLiteral } from '@newflow/backend-common';
import { NodeOperationError } from 'n8n-workflow';
import type { Workflow } from 'n8n-workflow';

/**
 * Optional properties that should be propagated from an error object to the new Error instance.
 */
const errorProperties = ['description', 'stack', 'executionId', 'workflowId'];

export function objectToError(errorObject: unknown, workflow: Workflow): Error {
	// TODO: Expand with other error types
	if (errorObject instanceof Error) {
		// If it's already an Error instance, return it as is.
		return errorObject;
	} else if (
		isObjectLiteral(errorObject) &&
		'message' in errorObject &&
		typeof errorObject.message === 'string'
	) {
		// If it's an object with a 'message' property, create a new Error instance.
		let error: Error | undefined;
		if (
			'node' in errorObject &&
			isObjectLiteral(errorObject.node) &&
			typeof errorObject.node.name === 'string'
		) {
			const node = workflow.getNode(errorObject.node.name);

			if (node) {
				error = new NodeOperationError(
					node,
					errorObject as unknown as Error,
					errorObject as object,
				);
			}
		}

		if (error === undefined) {
			error = new Error(errorObject.message);
		}

		for (const field of errorProperties) {
			if (field in errorObject && errorObject[field]) {
				// Not all errors contain these properties
				(error as unknown as Record<string, unknown>)[field] = errorObject[field];
			}
		}

		return error;
	} else {
		// If it's neither an Error nor an object with a 'message' property, create a generic Error.
		return new Error('An error occurred');
	}
}
