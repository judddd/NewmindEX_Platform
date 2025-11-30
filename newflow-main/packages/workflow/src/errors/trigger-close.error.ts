/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ApplicationError, type ErrorLevel } from '@n8n/errors';
import type { INode } from '../interfaces';

interface TriggerCloseErrorOptions extends ErrorOptions {
	level: ErrorLevel;
}

export class TriggerCloseError extends ApplicationError {
	constructor(
		readonly node: INode,
		{ cause, level }: TriggerCloseErrorOptions,
	) {
		super('Trigger Close Failed', { cause, extra: { nodeName: node.name } });
		this.level = level;
	}
}
