/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IrreversibleMigration, MigrationContext } from '../migration-types';

export class FixExecutionMetadataSequence1721377157740 implements IrreversibleMigration {
	async up({ queryRunner, escape }: MigrationContext) {
		const tableName = escape.tableName('execution_metadata');
		const sequenceName = escape.tableName('execution_metadata_temp_id_seq');

		await queryRunner.query(
			`SELECT setval('${sequenceName}', (SELECT MAX(id) FROM ${tableName}));`,
		);
	}
}
