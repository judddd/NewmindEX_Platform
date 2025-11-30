/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mockInstance } from '@newflow/backend-test-utils';
import { ExecutionMetadataRepository } from '@newflow/db';
import { Container } from '@newflow/di';

import { ExecutionMetadataService } from '@/services/execution-metadata.service';

describe('ExecutionMetadataService', () => {
	const repository = mockInstance(ExecutionMetadataRepository);

	test('Execution metadata is saved in a batch', async () => {
		const toSave = {
			test1: 'value1',
			test2: 'value2',
		};
		const executionId = '1234';

		await Container.get(ExecutionMetadataService).save(executionId, toSave);

		expect(repository.upsert).toHaveBeenCalledTimes(1);
		expect(repository.upsert.mock.calls[0]).toEqual([
			[
				{
					executionId,
					key: 'test1',
					value: 'value1',
				},
				{
					executionId,
					key: 'test2',
					value: 'value2',
				},
			],
			{
				conflictPaths: {
					executionId: true,
					key: true,
				},
			},
		]);
	});
});
