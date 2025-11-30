/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { BaseMigration, MigrationContext } from '../migration-types';

export class UpdateParentFolderIdColumn1740445074052 implements BaseMigration {
	async up({ escape, queryRunner }: MigrationContext) {
		const workflowTableName = escape.tableName('workflow_entity');
		const folderTableName = escape.tableName('folder');
		const parentFolderIdColumn = escape.columnName('parentFolderId');
		const idColumn = escape.columnName('id');

		await queryRunner.query(
			`ALTER TABLE ${workflowTableName} ADD CONSTRAINT fk_workflow_parent_folder FOREIGN KEY (${parentFolderIdColumn}) REFERENCES ${folderTableName}(${idColumn}) ON DELETE CASCADE`,
		);
	}
}
