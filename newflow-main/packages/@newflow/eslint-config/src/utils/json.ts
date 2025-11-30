/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { TSESTree } from '@typescript-eslint/utils';

export const isJsonParseCall = (node: TSESTree.CallExpression) =>
	node.callee.type === 'MemberExpression' &&
	node.callee.object.type === 'Identifier' &&
	node.callee.object.name === 'JSON' &&
	node.callee.property.type === 'Identifier' &&
	node.callee.property.name === 'parse';

export const isJsonStringifyCall = (node: TSESTree.CallExpression) => {
	const parseArg = node.arguments?.[0];
	return (
		parseArg !== undefined &&
		parseArg.type === 'CallExpression' &&
		parseArg.callee.type === 'MemberExpression' &&
		parseArg.callee.object.type === 'Identifier' &&
		parseArg.callee.object.name === 'JSON' &&
		parseArg.callee.property.type === 'Identifier' &&
		parseArg.callee.property.name === 'stringify'
	);
};
