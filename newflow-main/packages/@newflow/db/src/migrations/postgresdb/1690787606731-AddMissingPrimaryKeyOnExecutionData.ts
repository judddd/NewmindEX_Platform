/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IrreversibleMigration, MigrationContext } from '../migration-types';

export class AddMissingPrimaryKeyOnExecutionData1690787606731 implements IrreversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}execution_data" ADD PRIMARY KEY("executionId");`,
		);
	}
}
