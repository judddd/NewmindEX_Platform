/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IrreversibleMigration, MigrationContext } from '../migration-types';

/**
 * Drop the `role` table introduced by `CreateUserManagement1646992772331` and later
 * abandoned with the move to `@newflow/permissions` in https://github.com/n8n-io/n8n/pull/7650
 *
 * Irreversible as there is no use case for restoring a long unused table.
 */
export class DropRoleTable1745934666077 implements IrreversibleMigration {
	async up({ schemaBuilder: { dropTable } }: MigrationContext) {
		await dropTable('role');
	}
}
