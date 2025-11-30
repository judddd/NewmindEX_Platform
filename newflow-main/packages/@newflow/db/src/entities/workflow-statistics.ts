/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Column, Entity, ManyToOne, PrimaryColumn } from '@n8n/typeorm';

import { DateTimeColumn } from './abstract-entity';
import { StatisticsNames } from './types-db';
import { WorkflowEntity } from './workflow-entity';

@Entity()
export class WorkflowStatistics {
	@Column()
	count: number;

	@Column()
	rootCount: number;

	@DateTimeColumn()
	latestEvent: Date;

	@PrimaryColumn({ length: 128 })
	name: StatisticsNames;

	@ManyToOne('WorkflowEntity', 'shared')
	workflow: WorkflowEntity;

	@PrimaryColumn()
	workflowId: string;
}
