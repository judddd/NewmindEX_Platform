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
import { Container } from '@newflow/di';

import { BaseCommand } from '../base-command';
import { ExportService } from '@/services/export.service';

const flagsSchema = z.object({
	outputDir: z
		.string()
		.describe('Output directory path')
		.default(path.join(__dirname, './outputs')),
});

@Command({
	name: 'export:entities',
	description: 'Export database entities to JSON files',
	examples: ['', '--outputDir=./exports', '--outputDir=/path/to/backup'],
	flagsSchema,
})
export class ExportEntitiesCommand extends BaseCommand<z.infer<typeof flagsSchema>> {
	async run() {
		const outputDir = this.flags.outputDir;

		await Container.get(ExportService).exportEntities(outputDir);
	}

	catch(error: Error) {
		this.logger.error('❌ Error exporting entities. See log messages for details. \n');
		this.logger.error('Error details:');
		this.logger.error('\n====================================\n');
		this.logger.error(`${error.message} \n`);
	}
}
