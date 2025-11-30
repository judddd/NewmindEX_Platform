/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MigrationContext, ReversibleMigration } from '../migration-types';

const tableName = 'workflow_history';

export class ModifyWorkflowHistoryNodesAndConnections1695829275184 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, dropColumns, column } }: MigrationContext) {
		await dropColumns(tableName, ['nodes', 'connections']);
		await addColumns(tableName, [column('nodes').json.notNull, column('connections').json.notNull]);
	}

	async down({ schemaBuilder: { dropColumns, addColumns, column } }: MigrationContext) {
		await dropColumns(tableName, ['nodes', 'connections']);
		await addColumns(tableName, [column('nodes').text.notNull, column('connections').text.notNull]);
	}
}
