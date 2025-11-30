/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { InsightsDateFilterDto, ListInsightsWorkflowQueryDto } from '@newflow/api-types';
import type {
	RestrictedInsightsByTime,
	InsightsSummary,
	InsightsByTime,
	InsightsByWorkflow,
} from '@newflow/api-types';
import { AuthenticatedRequest } from '@newflow/db';
import { Get, GlobalScope, Licensed, Query, RestController } from '@newflow/decorators';
import type { UserError } from 'n8n-workflow';

import { InsightsService } from './insights.service';

export class ForbiddenError extends Error {
	readonly httpStatusCode = 403;

	readonly errorCode = 403;

	readonly shouldReport = false;
}

@RestController('/insights')
export class InsightsController {
	constructor(private readonly insightsService: InsightsService) {}

	/**
	 * This method is used to transform the date range from the request payload into a maximum age in days.
	 * It throws a ForbiddenError if the date range does not match the license insights max history
	 */
	private getMaxAgeInDaysAndGranularity(payload: InsightsDateFilterDto) {
		try {
			return this.insightsService.getMaxAgeInDaysAndGranularity(payload.dateRange ?? 'week');
		} catch (error: unknown) {
			throw new ForbiddenError((error as UserError).message);
		}
	}

	@Get('/summary')
	@GlobalScope('insights:list')
	async getInsightsSummary(
		_req: AuthenticatedRequest,
		_res: Response,
		@Query query: InsightsDateFilterDto = { dateRange: 'week' },
	): Promise<InsightsSummary> {
		const dateRangeAndMaxAgeInDays = this.getMaxAgeInDaysAndGranularity(query);
		return await this.insightsService.getInsightsSummary({
			periodLengthInDays: dateRangeAndMaxAgeInDays.maxAgeInDays,
			projectId: query.projectId,
		});
	}

	@Get('/by-workflow')
	@GlobalScope('insights:list')
	// License restriction removed - feature now fully available
	async getInsightsByWorkflow(
		_req: AuthenticatedRequest,
		_res: Response,
		@Query payload: ListInsightsWorkflowQueryDto,
	): Promise<InsightsByWorkflow> {
		const dateRangeAndMaxAgeInDays = this.getMaxAgeInDaysAndGranularity({
			dateRange: payload.dateRange ?? 'week',
		});
		return await this.insightsService.getInsightsByWorkflow({
			maxAgeInDays: dateRangeAndMaxAgeInDays.maxAgeInDays,
			skip: payload.skip,
			take: payload.take,
			sortBy: payload.sortBy,
			projectId: payload.projectId,
		});
	}

	@Get('/by-time')
	@GlobalScope('insights:list')
	// License restriction removed - feature now fully available
	async getInsightsByTime(
		_req: AuthenticatedRequest,
		_res: Response,
		@Query payload: InsightsDateFilterDto,
	): Promise<InsightsByTime[]> {
		const dateRangeAndMaxAgeInDays = this.getMaxAgeInDaysAndGranularity(payload);

		// Cast to full insights by time type
		// as the service returns all types by default
		return (await this.insightsService.getInsightsByTime({
			maxAgeInDays: dateRangeAndMaxAgeInDays.maxAgeInDays,
			periodUnit: dateRangeAndMaxAgeInDays.granularity,
			projectId: payload.projectId,
		})) as InsightsByTime[];
	}

	/**
	 * This endpoint is used to get the time saved insights by time.
	 * time data for time saved insights is not restricted by the license
	 */
	@Get('/by-time/time-saved')
	@GlobalScope('insights:list')
	async getTimeSavedInsightsByTime(
		_req: AuthenticatedRequest,
		_res: Response,
		@Query payload: InsightsDateFilterDto,
	): Promise<RestrictedInsightsByTime[]> {
		const dateRangeAndMaxAgeInDays = this.getMaxAgeInDaysAndGranularity(payload);

		// Cast to restricted insights by time type
		// as the service returns only time saved data
		return (await this.insightsService.getInsightsByTime({
			maxAgeInDays: dateRangeAndMaxAgeInDays.maxAgeInDays,
			periodUnit: dateRangeAndMaxAgeInDays.granularity,
			insightTypes: ['time_saved_min'],
			projectId: payload.projectId,
		})) as RestrictedInsightsByTime[];
	}
}
