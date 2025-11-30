/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import assert from 'node:assert';

import type { IrreversibleMigration, MigrationContext } from '../migration-types';

export class AddMissingPrimaryKeyOnAnnotationTagMapping1728659839644
	implements IrreversibleMigration
{
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		// Check if the primary key already exists
		const table = await queryRunner.getTable(`${tablePrefix}execution_annotation_tags`);

		assert(table, 'execution_annotation_tags table not found');

		const hasPrimaryKey = table.primaryColumns.length > 0;

		if (!hasPrimaryKey) {
			await queryRunner.createPrimaryKey(`${tablePrefix}execution_annotation_tags`, [
				'annotationId',
				'tagId',
			]);
		}
	}
}
