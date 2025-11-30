/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { NodeError } from './abstract/node.error';
import { ApplicationError } from '@n8n/errors';
import type { NodeOperationErrorOptions } from './node-api.error';
import type { INode, JsonObject } from '../interfaces';

/**
 * Class for instantiating an operational error, e.g. an invalid credentials error.
 */
export class NodeOperationError extends NodeError {
	type: string | undefined;

	constructor(
		node: INode,
		error: Error | string | JsonObject,
		options: NodeOperationErrorOptions = {},
	) {
		if (error instanceof NodeOperationError) {
			return error;
		}

		if (typeof error === 'string') {
			error = new ApplicationError(error, { level: options.level ?? 'warning' });
		}

		super(node, error);

		if (error instanceof NodeError && error?.messages?.length) {
			error.messages.forEach((message) => this.addToMessages(message));
		}

		if (options.message) this.message = options.message;
		this.level = options.level ?? 'warning';
		if (options.functionality) this.functionality = options.functionality;
		if (options.type) this.type = options.type;
		this.description = options.description;
		this.context.runIndex = options.runIndex;
		this.context.itemIndex = options.itemIndex;
		this.context.metadata = options.metadata;

		if (this.message === this.description) {
			this.description = undefined;
		}

		[this.message, this.messages] = this.setDescriptiveErrorMessage(
			this.message,
			this.messages,
			undefined,
			options.messageMapping,
		);
	}
}
