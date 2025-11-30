/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Command } from '@oclif/core';

import { detectPackageManager } from '../utils/package-manager';

export default class Prerelease extends Command {
	static override description =
		'Only for internal use. Prevent npm publish, instead require npm run release';
	static override examples = ['<%= config.bin %> <%= command.id %>'];
	static override flags = {};
	static override hidden = true;

	async run(): Promise<void> {
		await this.parse(Prerelease);

		const packageManager = (await detectPackageManager()) ?? 'npm';

		if (!process.env.RELEASE_MODE) {
			console.log(`Run \`${packageManager} run release\` to publish the package`);
			process.exit(1);
		}
	}
}
