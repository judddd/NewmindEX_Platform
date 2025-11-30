/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddWebhookId1611071044839 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			'CREATE TABLE "temporary_webhook_entity" ("workflowId" integer NOT NULL, "webhookPath" varchar NOT NULL, "method" varchar NOT NULL, "node" varchar NOT NULL, "webhookId" varchar, "pathLength" integer, PRIMARY KEY ("webhookPath", "method"))',
		);
		await queryRunner.query(
			`INSERT INTO "temporary_webhook_entity"("workflowId", "webhookPath", "method", "node") SELECT "workflowId", "webhookPath", "method", "node" FROM "${tablePrefix}webhook_entity"`,
		);
		await queryRunner.query(`DROP TABLE "${tablePrefix}webhook_entity"`);
		await queryRunner.query(
			`ALTER TABLE "temporary_webhook_entity" RENAME TO "${tablePrefix}webhook_entity"`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_${tablePrefix}742496f199721a057051acf4c2" ON "${tablePrefix}webhook_entity" ("webhookId", "method", "pathLength") `,
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP INDEX "IDX_${tablePrefix}742496f199721a057051acf4c2"`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}webhook_entity" RENAME TO "temporary_webhook_entity"`,
		);
		await queryRunner.query(
			`CREATE TABLE "${tablePrefix}webhook_entity" ("workflowId" integer NOT NULL, "webhookPath" varchar NOT NULL, "method" varchar NOT NULL, "node" varchar NOT NULL, PRIMARY KEY ("webhookPath", "method"))`,
		);
		await queryRunner.query(
			`INSERT INTO "${tablePrefix}webhook_entity"("workflowId", "webhookPath", "method", "node") SELECT "workflowId", "webhookPath", "method", "node" FROM "temporary_webhook_entity"`,
		);
		await queryRunner.query('DROP TABLE "temporary_webhook_entity"');
	}
}
