/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class CreateIndexStoppedAt1594902918301 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			'CREATE INDEX `IDX_' +
				tablePrefix +
				'cefb067df2402f6aed0638a6c1` ON `' +
				tablePrefix +
				'execution_entity` (`stoppedAt`)',
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			'DROP INDEX `IDX_' +
				tablePrefix +
				'cefb067df2402f6aed0638a6c1` ON `' +
				tablePrefix +
				'execution_entity`',
		);
	}
}
