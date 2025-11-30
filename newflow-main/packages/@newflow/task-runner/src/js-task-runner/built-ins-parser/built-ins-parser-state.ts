/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { BrokerMessage } from '@/message-types';
import type { InputDataChunkDefinition } from '@/runner-types';

/**
 * Class to keep track of which built-in variables are accessed in the code
 */
export class BuiltInsParserState {
	neededNodeNames: Set<string> = new Set();

	needsAllNodes = false;

	needs$env = false;

	needs$input = false;

	needs$execution = false;

	needs$prevNode = false;

	constructor(opts: Partial<BuiltInsParserState> = {}) {
		Object.assign(this, opts);
	}

	/**
	 * Marks that all nodes are needed, including input data
	 */
	markNeedsAllNodes() {
		this.needsAllNodes = true;
		this.needs$input = true;
		this.neededNodeNames = new Set();
	}

	markNodeAsNeeded(nodeName: string) {
		if (this.needsAllNodes) {
			return;
		}

		this.neededNodeNames.add(nodeName);
	}

	markEnvAsNeeded() {
		this.needs$env = true;
	}

	markInputAsNeeded() {
		this.needs$input = true;
	}

	markExecutionAsNeeded() {
		this.needs$execution = true;
	}

	markPrevNodeAsNeeded() {
		this.needs$prevNode = true;
	}

	toDataRequestParams(
		chunk?: InputDataChunkDefinition,
	): BrokerMessage.ToRequester.TaskDataRequest['requestParams'] {
		return {
			dataOfNodes: this.needsAllNodes ? 'all' : Array.from(this.neededNodeNames),
			env: this.needs$env,
			input: {
				include: this.needs$input,
				chunk,
			},
			prevNode: this.needs$prevNode,
		};
	}

	static newNeedsAllDataState() {
		const obj = new BuiltInsParserState();
		obj.markNeedsAllNodes();
		obj.markEnvAsNeeded();
		obj.markInputAsNeeded();
		obj.markExecutionAsNeeded();
		obj.markPrevNodeAsNeeded();
		return obj;
	}
}
