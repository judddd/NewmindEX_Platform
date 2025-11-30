/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
// eslint-disable-next-line n8n-local-rules/misplaced-n8n-typeorm-import
import { DataSource, Repository } from '@n8n/typeorm';

import { InstalledPackages } from '@/modules/community-packages/installed-packages.entity';

@Service()
export class PackagesRepository extends Repository<InstalledPackages> {
	constructor(dataSource: DataSource) {
		super(InstalledPackages, dataSource.manager);
	}
}
