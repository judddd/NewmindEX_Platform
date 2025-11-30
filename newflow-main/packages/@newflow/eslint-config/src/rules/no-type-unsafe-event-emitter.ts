/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ESLintUtils } from '@typescript-eslint/utils';

export const NoTypeUnsafeEventEmitterRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow extending from `EventEmitter`, which is not type-safe.',
		},
		messages: {
			noExtendsEventEmitter: 'Extend from the type-safe `TypedEmitter` class instead.',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			ClassDeclaration(node) {
				if (
					node.superClass &&
					node.superClass.type === 'Identifier' &&
					node.superClass.name === 'EventEmitter' &&
					node.id?.name !== 'TypedEmitter'
				) {
					context.report({
						node: node.superClass,
						messageId: 'noExtendsEventEmitter',
					});
				}
			},
		};
	},
});
