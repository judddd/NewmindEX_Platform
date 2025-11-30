/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Z } from 'zod-class';

import { bannerNameSchema } from '../../schemas/banner-name.schema';

export class DismissBannerRequestDto extends Z.class({
	banner: bannerNameSchema.optional(),
}) {}
