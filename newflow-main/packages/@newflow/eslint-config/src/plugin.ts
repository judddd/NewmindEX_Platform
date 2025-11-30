/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ESLint } from 'eslint';
import { rules } from './rules/index.js';

const plugin = {
	meta: {
		name: 'n8n-local-rules',
	},
	configs: {},
	// @ts-expect-error Rules type does not match for typescript-eslint and eslint
	rules: rules as ESLint.Plugin['rules'],
} satisfies ESLint.Plugin;

export const localRulesPlugin = {
	...plugin,
	configs: {
		recommended: {
			plugins: {
				'n8n-local-rules': plugin,
			},
			rules: {
				'n8n-local-rules/no-uncaught-json-parse': 'error',
				'n8n-local-rules/no-json-parse-json-stringify': 'error',
				'n8n-local-rules/no-unneeded-backticks': 'error',
				'n8n-local-rules/no-interpolation-in-regular-string': 'error',
				'n8n-local-rules/no-unused-param-in-catch-clause': 'error',
				'n8n-local-rules/no-useless-catch-throw': 'error',
				'n8n-local-rules/no-internal-package-import': 'error',
			},
		},
	},
} satisfies ESLint.Plugin;
