/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';

import type { LicenseFlag, ModuleClass } from './module';

type ModuleEntry = {
	class: ModuleClass;
	licenseFlag?: LicenseFlag;
};

@Service()
export class ModuleMetadata {
	private readonly modules: Map<string, ModuleEntry> = new Map();

	register(moduleName: string, moduleEntry: ModuleEntry) {
		this.modules.set(moduleName, moduleEntry);
	}

	get(moduleName: string) {
		return this.modules.get(moduleName);
	}

	getEntries() {
		return [...this.modules.entries()];
	}

	getClasses() {
		return [...this.modules.values()].map((entry) => entry.class);
	}
}
