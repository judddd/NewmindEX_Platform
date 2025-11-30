/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Entity, PrimaryColumn } from '@n8n/typeorm';
import type { IProcessedDataEntries, IProcessedDataLatest } from 'n8n-workflow';

import { JsonColumn, WithTimestamps } from './abstract-entity';
import { objectRetriever } from '../utils/transformers';

@Entity()
export class ProcessedData extends WithTimestamps {
	@PrimaryColumn('varchar')
	context: string;

	@PrimaryColumn()
	workflowId: string;

	@JsonColumn({
		nullable: true,
		transformer: objectRetriever,
	})
	value: IProcessedDataEntries | IProcessedDataLatest;
}
