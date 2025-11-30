/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class SeparateExecutionCreationFromStart1727427440136 implements ReversibleMigration {
	async up({
		schemaBuilder: { addColumns, column, dropNotNull },
		runQuery,
		escape,
	}: MigrationContext) {
		await addColumns('execution_entity', [
			column('createdAt').notNull.timestamp().default('NOW()'),
		]);

		await dropNotNull('execution_entity', 'startedAt');

		const executionEntity = escape.tableName('execution_entity');
		const createdAt = escape.columnName('createdAt');
		const startedAt = escape.columnName('startedAt');

		// inaccurate for pre-migration rows but prevents `createdAt` from being nullable
		await runQuery(`UPDATE ${executionEntity} SET ${createdAt} = ${startedAt};`);
	}

	async down({ schemaBuilder: { dropColumns, addNotNull } }: MigrationContext) {
		await dropColumns('execution_entity', ['createdAt']);
		await addNotNull('execution_entity', 'startedAt');
	}
}
