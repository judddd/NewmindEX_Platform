/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoArgumentSpreadRule } from './no-argument-spread.js';

const ruleTester = new RuleTester();

ruleTester.run('no-unbounded-argument-spread', NoArgumentSpreadRule, {
	valid: [
		{ code: 'fn(1, 2, 3)' },
		{ code: 'fn(...[1, 2, 3])' },
		{ code: 'new Foo(...[1, 2])' },
		{ code: 'fn.apply(null, deps)' },
		{ code: 'Reflect.construct(Foo, deps)' },
	],

	invalid: [
		{
			code: 'fn(...deps)',
			output: 'fn.apply(undefined, deps)',
			errors: [{ messageId: 'replaceWithApply' }],
		},
		{
			code: 'obj.fn(...deps)',
			output: 'obj.fn.apply(obj, deps)',
			errors: [{ messageId: 'replaceWithApply' }],
		},
		{
			code: 'instance = metadata.factory(...dependencies);',
			output: 'instance = metadata.factory.apply(metadata, dependencies);',
			errors: [{ messageId: 'replaceWithApply' }],
		},
		{
			code: 'new Foo(...deps)',
			output: 'Reflect.construct(Foo, deps)',
			errors: [{ messageId: 'replaceWithReflect' }],
		},
		{
			code: 'someFunction(a, ...deps)',
			output: null, // multiple args — no fix
			errors: [{ messageId: 'replaceWithApply' }],
		},
		{
			code: 'new Bar(a, ...deps)',
			output: null,
			errors: [{ messageId: 'replaceWithReflect' }],
		},
	],
});
