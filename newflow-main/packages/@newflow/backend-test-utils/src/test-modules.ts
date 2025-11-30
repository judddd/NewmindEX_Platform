/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ModuleRegistry } from '@newflow/backend-common';
import type { ModuleName } from '@newflow/backend-common';
import { Container } from '@newflow/di';

export async function loadModules(moduleNames: ModuleName[]) {
	await Container.get(ModuleRegistry).loadModules(moduleNames);
}
