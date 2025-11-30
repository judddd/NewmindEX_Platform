/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';

import { UnknownModuleError } from '../errors/unknown-module.error';
import { ModulesConfig } from '../modules.config';

beforeEach(() => {
	jest.resetAllMocks();
	process.env = {};
	Container.reset();
});

it('should throw `UnknownModuleError` if any enabled module name is invalid', () => {
	process.env.NEWFLOW_ENABLED_MODULES = 'insights,invalidModule';
	expect(() => Container.get(ModulesConfig)).toThrowError(UnknownModuleError);
});

it('should throw `UnknownModuleError` if any disabled module name is invalid', () => {
	process.env.NEWFLOW_DISABLED_MODULES = 'insights,invalidModule';
	expect(() => Container.get(ModulesConfig)).toThrowError(UnknownModuleError);
});
