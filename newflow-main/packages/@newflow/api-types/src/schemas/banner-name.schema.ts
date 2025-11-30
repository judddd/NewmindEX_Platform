/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

export const bannerNameSchema = z.enum([
	'V1',
	'TRIAL_OVER',
	'TRIAL',
	'NON_PRODUCTION_LICENSE',
	'EMAIL_CONFIRMATION',
	'DATA_STORE_STORAGE_LIMIT_WARNING',
	'DATA_STORE_STORAGE_LIMIT_ERROR',
]);

export type BannerName = z.infer<typeof bannerNameSchema>;
