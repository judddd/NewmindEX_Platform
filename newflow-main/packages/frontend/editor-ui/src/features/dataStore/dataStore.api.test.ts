/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { deleteDataStoreRowsApi } from '@/features/dataStore/dataStore.api';
import { makeRestApiRequest } from '@newflow/rest-api-client';
import { expect } from 'vitest';

vi.mock('@newflow/rest-api-client', () => ({
	makeRestApiRequest: vi.fn(),
}));

describe('dataStore.api', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('deleteDataStoreRowsApi', () => {
		it('should make DELETE request with correct parameters', async () => {
			const dataStoreId = 'test-datastore-id';
			const projectId = 'test-project-id';
			const rowIds = [1, 2, 3];

			vi.mocked(makeRestApiRequest).mockResolvedValue(true);

			const result = await deleteDataStoreRowsApi(
				{ baseUrl: '/rest', pushRef: 'test-push-ref' },
				dataStoreId,
				rowIds,
				projectId,
			);

			expect(makeRestApiRequest).toHaveBeenCalledWith(
				expect.anything(),
				'DELETE',
				`/projects/${projectId}/data-tables/${dataStoreId}/rows`,
				{
					filter: {
						type: 'or',
						filters: [
							{ columnName: 'id', condition: 'eq', value: 1 },
							{ columnName: 'id', condition: 'eq', value: 2 },
							{ columnName: 'id', condition: 'eq', value: 3 },
						],
					},
				},
			);
			expect(result).toBe(true);
		});
	});
});
