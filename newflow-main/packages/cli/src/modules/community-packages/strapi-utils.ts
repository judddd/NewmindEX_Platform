/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import { Container } from '@newflow/di';
import axios from 'axios';
import { ErrorReporter } from 'n8n-core';

interface ResponseData<T> {
	data: Array<Entity<T>>;
	meta: Meta;
}

interface Meta {
	pagination: Pagination;
}

export interface Entity<T> {
	id: number;
	attributes: T;
}

interface Pagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

const REQUEST_TIMEOUT_MS = 3000;

export async function paginatedRequest<T>(url: string): Promise<T[]> {
	let returnData: T[] = [];
	let responseData: T[] | undefined = [];

	const params = {
		pagination: {
			page: 1,
			pageSize: 25,
		},
	};

	do {
		let response;
		try {
			response = await axios.get<ResponseData<T>>(url, {
				headers: { 'Content-Type': 'application/json' },
				params,
				timeout: REQUEST_TIMEOUT_MS,
			});
		} catch (error) {
			Container.get(ErrorReporter).error(error, {
				tags: { source: 'communityNodesPaginatedRequest' },
			});
			Container.get(Logger).error(
				`Error while fetching community nodes: ${(error as Error).message}`,
			);
			break;
		}

		responseData = response?.data?.data?.map((item) => item.attributes);

		if (!responseData?.length) break;

		returnData = returnData.concat(responseData);

		if (response?.data?.meta?.pagination) {
			const { page, pageCount } = response?.data.meta.pagination;

			if (page === pageCount) {
				break;
			}
		}

		params.pagination.page++;
	} while (responseData?.length);

	return returnData;
}
