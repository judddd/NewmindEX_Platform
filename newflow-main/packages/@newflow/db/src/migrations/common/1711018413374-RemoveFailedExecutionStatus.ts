/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IrreversibleMigration, MigrationContext } from '../migration-types';

export class RemoveFailedExecutionStatus1711018413374 implements IrreversibleMigration {
	async up({ escape, runQuery }: MigrationContext) {
		const executionEntity = escape.tableName('execution_entity');

		await runQuery(`UPDATE ${executionEntity} SET status = 'error' WHERE status = 'failed';`);
	}
}
