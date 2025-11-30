/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { GlobalRole } from '@newflow/permissions';
import { getApiKeyScopesForRole } from '@newflow/permissions';

import { GLOBAL_ROLES } from '../../constants';
import { ApiKey } from '../../entities';
import type { MigrationContext, ReversibleMigration } from '../migration-types';

type ApiKeyWithRole = { id: string; role: GlobalRole };

export class AddScopesColumnToApiKeys1742918400000 implements ReversibleMigration {
	async up({
		runQuery,
		escape,
		queryRunner,
		schemaBuilder: { addColumns, column },
	}: MigrationContext) {
		await addColumns('user_api_keys', [column('scopes').json]);

		const userApiKeysTable = escape.tableName('user_api_keys');
		const userTable = escape.tableName('user');
		const idColumn = escape.columnName('id');
		const userIdColumn = escape.columnName('userId');
		const roleColumn = escape.columnName('role');

		const apiKeysWithRoles = await runQuery<ApiKeyWithRole[]>(
			`SELECT ${userApiKeysTable}.${idColumn} AS id, ${userTable}.${roleColumn} AS role FROM ${userApiKeysTable} JOIN ${userTable} ON ${userTable}.${idColumn} = ${userApiKeysTable}.${userIdColumn}`,
		);

		for (const { id, role } of apiKeysWithRoles) {
			// Simplified: all api keys get empty scopes (no restrictions)
			const scopes: string[] = [];
			await queryRunner.manager.update(ApiKey, { id }, { scopes });
		}
	}

	async down({ schemaBuilder: { dropColumns } }: MigrationContext) {
		await dropColumns('user_api_keys', ['scopes']);
	}
}
