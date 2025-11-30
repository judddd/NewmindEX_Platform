/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { v4 as uuidv4 } from 'uuid';

import type { MigrationContext, ReversibleMigration } from '../migration-types';

type Workflow = { id: number };

export class AddWorkflowVersionIdColumn1669739707124 implements ReversibleMigration {
	async up({ escape, runQuery }: MigrationContext) {
		const tableName = escape.tableName('workflow_entity');
		const columnName = escape.columnName('versionId');

		await runQuery(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} CHAR(36)`);

		const workflowIds: Workflow[] = await runQuery(`SELECT id FROM ${tableName}`);
		for (const { id } of workflowIds) {
			await runQuery(`UPDATE ${tableName} SET ${columnName} = :versionId WHERE id = :id`, {
				versionId: uuidv4(),
				id,
			});
		}
	}

	async down({ escape, runQuery }: MigrationContext) {
		const tableName = escape.tableName('workflow_entity');
		const columnName = escape.columnName('versionId');
		await runQuery(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
	}
}
