/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoTopLevelRelativeImportsInBackendModuleRule } from './no-top-level-relative-imports-in-backend-module.js';

const ruleTester = new RuleTester();

ruleTester.run(
	'no-top-level-relative-imports-in-backend-module',
	NoTopLevelRelativeImportsInBackendModuleRule,
	{
		valid: [
			{
				code: `
import { Container } from '@newflow/di';
import { InstanceSettings } from 'n8n-core';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		const { LocalService } = await import('./local.service');
	}
}`,
			},
		],
		invalid: [
			{
				code: `
import { Container } from '@newflow/di';
import { LocalService } from './local.service';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		// code
	}
}`,
				errors: [{ messageId: 'placeInsideInit' }],
			},
			{
				code: `
import { BackendModule } from '@newflow/decorators';
import { helper } from './helper';
import { config } from './config';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		// code
	}
}`,
				errors: [{ messageId: 'placeInsideInit' }, { messageId: 'placeInsideInit' }],
			},
		],
	},
);
