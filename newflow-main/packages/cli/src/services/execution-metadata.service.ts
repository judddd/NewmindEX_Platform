/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ExecutionMetadata } from '@newflow/db';
import { ExecutionMetadataRepository } from '@newflow/db';
import { Service } from '@newflow/di';

@Service()
export class ExecutionMetadataService {
	constructor(private readonly executionMetadataRepository: ExecutionMetadataRepository) {}

	async save(executionId: string, executionMetadata: Record<string, string>): Promise<void> {
		const metadataRows: Array<Pick<ExecutionMetadata, 'executionId' | 'key' | 'value'>> = [];
		for (const [key, value] of Object.entries(executionMetadata)) {
			metadataRows.push({
				executionId,
				key,
				value,
			});
		}

		await this.executionMetadataRepository.upsert(metadataRows, {
			conflictPaths: { executionId: true, key: true },
		});
	}
}
