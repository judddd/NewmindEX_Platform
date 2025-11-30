/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { AuthenticatedRequest } from '@newflow/db';
import { Get, RestController } from '@newflow/decorators';
import express from 'express';

import { CtaService } from '@/services/cta.service';

/**
 * Controller for Call to Action (CTA) endpoints. CTAs are certain
 * messages that are shown to users in the UI.
 */
@RestController('/cta')
export class CtaController {
	constructor(private readonly ctaService: CtaService) {}

	@Get('/become-creator')
	async getCta(req: AuthenticatedRequest, res: express.Response) {
		const becomeCreator = await this.ctaService.getBecomeCreatorCta(req.user.id);

		res.json(becomeCreator);
	}
}
