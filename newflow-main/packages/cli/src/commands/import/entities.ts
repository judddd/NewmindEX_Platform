/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Command } from '@newflow/decorators';
import { z } from 'zod';
import path from 'path';

import { BaseCommand } from '../base-command';

const flagsSchema = z.object({
	inputDir: z
		.string()
		.describe('Input directory that holds output files for import')
		.default(path.join(__dirname, './outputs')),
});

@Command({
	name: 'import:entities',
	description: 'Import database entities from JSON files',
	examples: ['', '--inputDir=./exports', '--inputDir=/path/to/backup'],
	flagsSchema,
})
export class ImportEntitiesCommand extends BaseCommand<z.infer<typeof flagsSchema>> {
	async run() {
		const inputDir = this.flags.inputDir;

		this.logger.info('\n⚠️⚠️ This feature is currently under development. ⚠️⚠️');
		this.logger.info('\n🚀 Starting entity import...');
		this.logger.info(`📁 Input directory: ${inputDir}`);

		// TODO: Import entities

		this.logger.info('✅ Task completed successfully! \n');
	}

	catch(error: Error) {
		this.logger.error('❌ Error importing entities. See log messages for details. \n');
		this.logger.error('Error details:');
		this.logger.error('\n====================================\n');
		this.logger.error(`${error.message} \n`);
	}
}
