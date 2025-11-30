/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddManagedColumnToCredentialsTable1734479635324 implements ReversibleMigration {
	async up({ escape, runQuery, isSqlite }: MigrationContext) {
		const tableName = escape.tableName('credentials_entity');
		const columnName = escape.columnName('isManaged');

		const defaultValue = isSqlite ? 0 : 'FALSE';

		await runQuery(
			`ALTER TABLE ${tableName} ADD COLUMN ${columnName} BOOLEAN NOT NULL DEFAULT ${defaultValue}`,
		);
	}

	async down({ escape, runQuery }: MigrationContext) {
		const tableName = escape.tableName('credentials_entity');
		const columnName = escape.columnName('isManaged');

		await runQuery(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
	}
}
