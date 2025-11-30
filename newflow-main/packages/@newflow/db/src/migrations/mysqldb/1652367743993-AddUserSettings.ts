/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddUserSettings1652367743993 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			'ALTER TABLE `' + tablePrefix + 'user` ADD COLUMN `settings` json NULL DEFAULT NULL',
		);
		await queryRunner.query(
			'ALTER TABLE `' +
				tablePrefix +
				'user` CHANGE COLUMN `personalizationAnswers` `personalizationAnswers` json NULL DEFAULT NULL',
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query('ALTER TABLE `' + tablePrefix + 'user` DROP COLUMN `settings`');
	}
}
