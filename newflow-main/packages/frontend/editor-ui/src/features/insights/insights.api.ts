/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { makeRestApiRequest } from '@newflow/rest-api-client';
import type { IRestApiContext } from '@newflow/rest-api-client';
import type {
	InsightsSummary,
	InsightsByTime,
	InsightsByWorkflow,
	ListInsightsWorkflowQueryDto,
	InsightsDateRange,
} from '@newflow/api-types';

export const fetchInsightsSummary = async (
	context: IRestApiContext,
	filter?: { dateRange: InsightsDateRange['key'] },
): Promise<InsightsSummary> =>
	await makeRestApiRequest(context, 'GET', '/insights/summary', filter);

export const fetchInsightsByTime = async (
	context: IRestApiContext,
	filter?: { dateRange: InsightsDateRange['key']; projectId?: string },
): Promise<InsightsByTime[]> =>
	await makeRestApiRequest(context, 'GET', '/insights/by-time', filter);

export const fetchInsightsTimeSaved = async (
	context: IRestApiContext,
	filter?: { dateRange: InsightsDateRange['key']; projectId?: string },
): Promise<InsightsByTime[]> =>
	await makeRestApiRequest(context, 'GET', '/insights/by-time/time-saved', filter);

export const fetchInsightsByWorkflow = async (
	context: IRestApiContext,
	filter?: ListInsightsWorkflowQueryDto,
): Promise<InsightsByWorkflow> =>
	await makeRestApiRequest(context, 'GET', '/insights/by-workflow', filter);
