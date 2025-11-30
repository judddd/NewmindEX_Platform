/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INode } from '../interfaces';
import { ExecutionBaseError } from './abstract/execution-base.error';

/**
 * Class for instantiating an operational error, e.g. a timeout error.
 */
export class WorkflowOperationError extends ExecutionBaseError {
	node: INode | undefined;

	override timestamp: number;

	constructor(message: string, node?: INode, description?: string) {
		super(message, { cause: undefined });
		this.level = 'warning';
		this.name = this.constructor.name;
		if (description) this.description = description;
		this.node = node;
		this.timestamp = Date.now();
	}
}
