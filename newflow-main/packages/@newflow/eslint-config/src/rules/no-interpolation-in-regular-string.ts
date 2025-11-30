/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const NoInterpolationInRegularStringRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'String interpolation `${...}` requires backticks, not single or double quotes.',
		},
		messages: {
			useBackticks: 'Use backticks to interpolate',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			Literal(node) {
				if (typeof node.value !== 'string') return;

				if (/\$\{/.test(node.value)) {
					context.report({
						messageId: 'useBackticks',
						node,
						fix: (fixer) => fixer.replaceText(node, `\`${node.value}\``),
					});
				}
			},
		};
	},
});
