/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	DataStoreProxyFunctions,
	INode,
	Workflow,
	IWorkflowExecuteAdditionalData,
} from 'n8n-workflow';

export function getDataStoreHelperFunctions(
	additionalData: IWorkflowExecuteAdditionalData,
	workflow: Workflow,
	node: INode,
): Partial<DataStoreProxyFunctions> {
	const dataStoreProxyProvider = additionalData['data-table']?.dataStoreProxyProvider;
	if (!dataStoreProxyProvider) return {};
	return {
		getDataStoreAggregateProxy: async () =>
			await dataStoreProxyProvider.getDataStoreAggregateProxy(
				workflow,
				node,
				additionalData.dataTableProjectId,
			),
		getDataStoreProxy: async (dataStoreId: string) =>
			await dataStoreProxyProvider.getDataStoreProxy(
				workflow,
				node,
				dataStoreId,
				additionalData.dataTableProjectId,
			),
	};
}
