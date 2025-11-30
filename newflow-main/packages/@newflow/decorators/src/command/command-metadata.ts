/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';

import type { CommandEntry } from './types';

@Service()
export class CommandMetadata {
	private readonly commands: Map<string, CommandEntry> = new Map();

	register(name: string, entry: CommandEntry) {
		this.commands.set(name, entry);
	}

	get(name: string) {
		return this.commands.get(name);
	}

	getEntries() {
		return [...this.commands.entries()];
	}
}
