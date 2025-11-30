/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class CreateVariables1677501636753 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			CREATE TABLE ${tablePrefix}variables (
				id int(11) auto_increment NOT NULL PRIMARY KEY,
				\`key\` VARCHAR(50) NOT NULL,
				\`type\` VARCHAR(50) DEFAULT 'string' NOT NULL,
				value VARCHAR(255) NULL,
				UNIQUE (\`key\`)
			)
			ENGINE=InnoDB;
		`);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP TABLE ${tablePrefix}variables;`);
	}
}
