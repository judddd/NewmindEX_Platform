/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { BaseSelect } from './base.select.dto';

export class WorkflowSelect extends BaseSelect {
	static get selectableFields() {
		return new Set([
			'id', // always included downstream
			'name',
			'active',
			'tags',
			'createdAt',
			'updatedAt',
			'versionId',
			'ownedBy', // non-entity field
			'parentFolder',
		]);
	}

	static fromString(rawFilter: string) {
		return this.toSelect(rawFilter, WorkflowSelect);
	}
}
