/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddMfaColumns1690000000030 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, column } }: MigrationContext) {
		await addColumns('user', [
			column('mfaEnabled').bool.notNull.default(false),
			column('mfaSecret').text,
			column('mfaRecoveryCodes').text,
		]);
	}

	async down({ schemaBuilder: { dropColumns } }: MigrationContext) {
		await dropColumns('user', ['mfaEnabled', 'mfaSecret', 'mfaRecoveryCodes']);
	}
}
