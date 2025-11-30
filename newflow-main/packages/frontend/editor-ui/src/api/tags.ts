/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ITag } from '@newflow/rest-api-client/api/tags';
import type { IRestApiContext } from '@newflow/rest-api-client';
import { makeRestApiRequest } from '@newflow/rest-api-client';
import type { CreateOrUpdateTagRequestDto, RetrieveTagQueryDto } from '@newflow/api-types';

type TagsApiEndpoint = '/tags' | '/annotation-tags';

export function createTagsApi(endpoint: TagsApiEndpoint) {
	return {
		getTags: async (context: IRestApiContext, data: RetrieveTagQueryDto): Promise<ITag[]> => {
			return await makeRestApiRequest(context, 'GET', endpoint, data);
		},
		createTag: async (
			context: IRestApiContext,
			data: CreateOrUpdateTagRequestDto,
		): Promise<ITag> => {
			return await makeRestApiRequest(context, 'POST', endpoint, data);
		},
		updateTag: async (
			context: IRestApiContext,
			id: string,
			data: CreateOrUpdateTagRequestDto,
		): Promise<ITag> => {
			return await makeRestApiRequest(context, 'PATCH', `${endpoint}/${id}`, data);
		},
		deleteTag: async (context: IRestApiContext, id: string): Promise<boolean> => {
			return await makeRestApiRequest(context, 'DELETE', `${endpoint}/${id}`);
		},
	};
}
