/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, IrreversibleMigration } from '../migration-types';

export class MigrateExecutionStatus1676996103000 implements IrreversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "status" = 'waiting' WHERE "status" IS NULL AND "waitTill" IS NOT NULL;`,
		);
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "status" = 'failed' WHERE "status" IS NULL AND "finished"=false AND "stoppedAt" IS NOT NULL;`,
		);
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "status" = 'success' WHERE "status" IS NULL AND "finished"=true AND "stoppedAt" IS NOT NULL;`,
		);
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "status" = 'crashed' WHERE "status" IS NULL;`,
		);
	}
}
