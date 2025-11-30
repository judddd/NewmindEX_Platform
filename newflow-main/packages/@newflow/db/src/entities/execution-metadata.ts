/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from '@n8n/typeorm';

import { ExecutionEntity } from './execution-entity';

@Entity()
export class ExecutionMetadata {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne('ExecutionEntity', 'metadata', {
		onDelete: 'CASCADE',
	})
	execution: ExecutionEntity;

	@Column()
	executionId: string;

	@Column('text')
	key: string;

	@Column('text')
	value: string;
}
