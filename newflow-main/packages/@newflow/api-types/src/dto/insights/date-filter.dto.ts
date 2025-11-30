/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';
import { Z } from 'zod-class';

import { insightsDateRangeSchema } from '../../schemas/insights.schema';

const VALID_DATE_RANGE_OPTIONS = insightsDateRangeSchema.shape.key.options;

// Date range parameter validation
const dateRange = z.enum(VALID_DATE_RANGE_OPTIONS).optional();

export class InsightsDateFilterDto extends Z.class({
	dateRange,
	projectId: z.string().optional(),
}) {}
