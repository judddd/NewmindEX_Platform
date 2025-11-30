/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const NoUntypedConfigClassFieldRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce explicit typing of config class fields',
		},
		messages: {
			noUntypedConfigClassField:
				'Class field must have an explicit type annotation, e.g. `field: type = value`. See: https://github.com/n8n-io/n8n/pull/10433',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			PropertyDefinition(node) {
				if (!node.typeAnnotation) {
					context.report({ node: node.key, messageId: 'noUntypedConfigClassField' });
				}
			},
		};
	},
});
