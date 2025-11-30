/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class NodeCrashedError extends NodeOperationError {
	constructor(node: INode) {
		super(node, 'Node crashed, possible out-of-memory issue', {
			message: 'Execution stopped at this node',
			description:
				"n8n may have run out of memory while running this execution. More context and tips on how to avoid this <a href='http://newflow.ee/hosting/scaling/memory-errors/' target='_blank'>in the docs</a>",
		});
	}
}
