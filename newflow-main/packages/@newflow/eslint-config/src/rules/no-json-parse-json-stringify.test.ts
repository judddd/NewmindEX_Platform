/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoJsonParseJsonStringifyRule } from './no-json-parse-json-stringify.js';

const ruleTester = new RuleTester();

ruleTester.run('no-json-parse-json-stringify', NoJsonParseJsonStringifyRule, {
	valid: [
		{
			code: 'deepCopy(foo)',
		},
	],
	invalid: [
		{
			code: 'JSON.parse(JSON.stringify(foo))',
			errors: [{ messageId: 'noJsonParseJsonStringify' }],
			output: 'deepCopy(foo)',
		},
		{
			code: 'JSON.parse(JSON.stringify(foo.bar))',
			errors: [{ messageId: 'noJsonParseJsonStringify' }],
			output: 'deepCopy(foo.bar)',
		},
		{
			code: 'JSON.parse(JSON.stringify(foo.bar.baz))',
			errors: [{ messageId: 'noJsonParseJsonStringify' }],
			output: 'deepCopy(foo.bar.baz)',
		},
		{
			code: 'JSON.parse(JSON.stringify(foo.bar[baz]))',
			errors: [{ messageId: 'noJsonParseJsonStringify' }],
			output: 'deepCopy(foo.bar[baz])',
		},
	],
});
