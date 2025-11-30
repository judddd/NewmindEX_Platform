/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import type { Folder } from './folder';
import type { TagEntity } from './tag-entity';

@Entity({ name: 'folder_tag' })
export class FolderTagMapping {
	@PrimaryColumn()
	folderId: string;

	@ManyToOne('Folder', 'tagMappings')
	@JoinColumn({ name: 'folderId' })
	folders: Folder[];

	@PrimaryColumn()
	tagId: string;

	@ManyToOne('TagEntity', 'folderMappings')
	@JoinColumn({ name: 'tagId' })
	tags: TagEntity[];
}
