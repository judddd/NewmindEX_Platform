/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import { DataSource, Repository } from '@n8n/typeorm';

import { FolderTagMapping } from '../entities/folder-tag-mapping';

@Service()
export class FolderTagMappingRepository extends Repository<FolderTagMapping> {
	constructor(dataSource: DataSource) {
		super(FolderTagMapping, dataSource.manager);
	}

	async overwriteTags(folderId: string, tagIds: string[]) {
		return await this.manager.transaction(async (tx) => {
			await tx.delete(FolderTagMapping, { folderId });

			const tags = tagIds.map((tagId) => this.create({ folderId, tagId }));

			return await tx.insert(FolderTagMapping, tags);
		});
	}
}
