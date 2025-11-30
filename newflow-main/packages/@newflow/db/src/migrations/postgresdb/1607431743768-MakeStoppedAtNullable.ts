/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, IrreversibleMigration } from '../migration-types';

export class MakeStoppedAtNullable1607431743768 implements IrreversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			'ALTER TABLE ' + tablePrefix + 'execution_entity ALTER COLUMN "stoppedAt" DROP NOT NULL',
		);
	}
}
