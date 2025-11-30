/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const MisplacedN8nTypeormImportRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure `@n8n/typeorm` is imported only from within the `@newflow/db` package.',
		},
		messages: {
			moveImport: 'Please move this import to `@newflow/db`.',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			ImportDeclaration(node) {
				if (node.source.value === '@n8n/typeorm' && !context.filename.includes('@newflow/db')) {
					context.report({ node, messageId: 'moveImport' });
				}
			},
		};
	},
});
