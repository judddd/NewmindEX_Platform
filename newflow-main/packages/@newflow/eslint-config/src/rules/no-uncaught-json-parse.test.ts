/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoUncaughtJsonParseRule } from './no-uncaught-json-parse.js';

const ruleTester = new RuleTester();

ruleTester.run('no-uncaught-json-parse', NoUncaughtJsonParseRule, {
	valid: [
		{
			code: 'try { JSON.parse(foo) } catch (e) {}',
		},
		{
			code: 'JSON.parse(JSON.stringify(foo))',
		},
	],
	invalid: [
		{
			code: 'JSON.parse(foo)',
			errors: [{ messageId: 'noUncaughtJsonParse' }],
		},
	],
});
