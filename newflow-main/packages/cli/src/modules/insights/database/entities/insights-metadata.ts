/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from '@n8n/typeorm';

@Entity()
export class InsightsMetadata extends BaseEntity {
	@PrimaryGeneratedColumn()
	metaId: number;

	@Column({ unique: true, type: 'varchar', length: 16 })
	workflowId: string;

	@Column({ type: 'varchar', length: 36 })
	projectId: string;

	@Column({ type: 'varchar', length: 128 })
	workflowName: string;

	@Column({ type: 'varchar', length: 255 })
	projectName: string;
}
