/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const NoUnusedParamInCatchClauseRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'Unused param in catch clause must be omitted.',
		},
		messages: {
			removeUnusedParam: 'Remove unused param in catch clause',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			CatchClause(node) {
				if (node.param?.type === 'Identifier' && node.param.name.startsWith('_')) {
					const start = node.range[0] + 'catch '.length;
					const end = node.param.range[1] + '()'.length;

					context.report({
						messageId: 'removeUnusedParam',
						node,
						fix: (fixer) => fixer.removeRange([start, end]),
					});
				}
			},
		};
	},
});
