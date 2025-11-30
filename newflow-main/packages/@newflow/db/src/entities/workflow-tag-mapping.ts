/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import type { TagEntity } from './tag-entity';
import type { WorkflowEntity } from './workflow-entity';

@Entity({ name: 'workflows_tags' })
export class WorkflowTagMapping {
	@PrimaryColumn()
	workflowId: string;

	@ManyToOne('WorkflowEntity', 'tagMappings')
	@JoinColumn({ name: 'workflowId' })
	workflows: WorkflowEntity[];

	@PrimaryColumn()
	tagId: string;

	@ManyToOne('TagEntity', 'workflowMappings')
	@JoinColumn({ name: 'tagId' })
	tags: TagEntity[];
}
