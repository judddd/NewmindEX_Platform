/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Project, WithTimestampsAndStringId } from '@newflow/db';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from '@n8n/typeorm';

import { DataTableColumn } from './data-table-column.entity';

@Entity()
@Index(['name', 'projectId'], { unique: true })
export class DataTable extends WithTimestampsAndStringId {
	constructor() {
		super();
	}

	@Column()
	name: string;

	@OneToMany(
		() => DataTableColumn,
		(dataTableColumn) => dataTableColumn.dataTable,
		{
			cascade: true,
		},
	)
	columns: DataTableColumn[];

	@ManyToOne(() => Project)
	@JoinColumn({ name: 'projectId' })
	project: Project;

	@Column()
	projectId: string;
}
