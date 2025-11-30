/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WithTimestampsAndStringId } from '@newflow/db';
import { Column, Entity, Index, JoinColumn, ManyToOne } from '@n8n/typeorm';

import { type DataTable } from './data-table.entity';

@Entity()
@Index(['dataTableId', 'name'], { unique: true })
export class DataTableColumn extends WithTimestampsAndStringId {
	@Column()
	dataTableId: string;

	@Column()
	name: string;

	@Column({ type: 'varchar' })
	type: 'string' | 'number' | 'boolean' | 'date';

	@Column({ type: 'int' })
	index: number;

	@ManyToOne('DataTable', 'columns')
	@JoinColumn({ name: 'dataTableId' })
	dataTable: DataTable;
}
