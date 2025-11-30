/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Command, Flags } from '@oclif/core';

import { ChildProcessError, runCommand } from '../utils/child-process';

export default class Lint extends Command {
	static override description = 'Lint the node in the current directory. Includes auto-fixing.';
	static override examples = ['<%= config.bin %> <%= command.id %>'];
	static override flags = {
		fix: Flags.boolean({ description: 'Automatically fix problems', default: false }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(Lint);

		const args = ['.'];

		if (flags.fix) {
			args.push('--fix');
		}

		try {
			await runCommand('eslint', args, { context: 'local', stdio: 'inherit' });
		} catch (error: unknown) {
			if (error instanceof ChildProcessError) {
				if (error.signal) {
					process.kill(process.pid, error.signal);
				} else {
					process.exit(error.code ?? 0);
				}
			}
			throw error;
		}
	}
}
