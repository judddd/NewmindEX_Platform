/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Logger } from '@newflow/backend-common';
import { mock } from 'jest-mock-extended';

export const mockLogger = (): Logger =>
	mock<Logger>({ scoped: jest.fn().mockReturnValue(mock<Logger>()) });

export * from './random';
export * as testDb from './test-db';
export * as testModules from './test-modules';
export * from './db/workflows';
export * from './db/projects';
export * from './mocking';
