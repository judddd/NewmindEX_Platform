/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const NoUnneededBackticksRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description:
				'Template literal backticks may only be used for string interpolation or multiline strings.',
		},
		messages: {
			noUnneededBackticks: 'Use single or double quotes, not backticks',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			TemplateLiteral(node) {
				if (node.expressions.length > 0) return;
				if (node.quasis.every((q) => q.loc.start.line !== q.loc.end.line)) return;

				node.quasis.forEach((q) => {
					const escaped = q.value.raw.replace(/(?<!\\)'/g, "\\'");

					context.report({
						messageId: 'noUnneededBackticks',
						node,
						fix: (fixer) => fixer.replaceText(q, `'${escaped}'`),
					});
				});
			},
		};
	},
});
