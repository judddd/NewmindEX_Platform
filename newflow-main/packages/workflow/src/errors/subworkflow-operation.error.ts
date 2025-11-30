/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WorkflowOperationError } from './workflow-operation.error';

export class SubworkflowOperationError extends WorkflowOperationError {
	override description = '';

	override cause: Error;

	constructor(message: string, description: string) {
		super(message);
		this.name = this.constructor.name;
		this.description = description;

		this.cause = {
			name: this.name,
			message,
			stack: this.stack as string,
		};
	}
}
