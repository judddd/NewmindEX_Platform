/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ListDataStoreQueryDto } from '@newflow/api-types';
import { AuthenticatedRequest } from '@newflow/db';
import { Get, GlobalScope, Query, RestController } from '@newflow/decorators';

import { DataStoreAggregateService } from './data-store-aggregate.service';
import { DataStoreService } from './data-store.service';

@RestController('/data-tables-global')
export class DataStoreAggregateController {
	constructor(
		private readonly dataStoreAggregateService: DataStoreAggregateService,
		private readonly dataStoreService: DataStoreService,
	) {}

	@Get('/')
	@GlobalScope('dataStore:list')
	async listDataStores(
		req: AuthenticatedRequest,
		_res: Response,
		@Query payload: ListDataStoreQueryDto,
	) {
		return await this.dataStoreAggregateService.getManyAndCount(req.user, payload);
	}

	@Get('/limits')
	@GlobalScope('dataStore:list')
	async getDataTablesSize() {
		return await this.dataStoreService.getDataTablesSize();
	}
}
