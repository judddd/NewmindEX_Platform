/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class WorkflowStatistics1664196174002 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`CREATE TABLE ${tablePrefix}workflow_statistics (
				count INTEGER DEFAULT 0,
				latestEvent DATETIME,
				name VARCHAR(128) NOT NULL,
				workflowId INTEGER,
				PRIMARY KEY(workflowId, name),
				FOREIGN KEY(workflowId) REFERENCES ${tablePrefix}workflow_entity(id) ON DELETE CASCADE
			)`,
		);

		// Add dataLoaded column to workflow table
		await queryRunner.query(
			`ALTER TABLE ${tablePrefix}workflow_entity ADD COLUMN dataLoaded BOOLEAN DEFAULT false`,
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP TABLE "${tablePrefix}workflow_statistics"`);
		await queryRunner.query(`ALTER TABLE ${tablePrefix}workflow_entity DROP COLUMN dataLoaded`);
	}
}
