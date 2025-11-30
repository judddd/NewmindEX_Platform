/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';
import type { Response } from 'express';

import type { AuditRequest } from '@/public-api/types';

import { apiKeyHasScopeWithGlobalScopeFallback } from '../../shared/middlewares/global.middleware';

export = {
	generateAudit: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'securityAudit:generate' }),
		async (req: AuditRequest.Generate, res: Response): Promise<Response> => {
			try {
				const { SecurityAuditService } = await import('@/security-audit/security-audit.service');
				const result = await Container.get(SecurityAuditService).run(
					req.body?.additionalOptions?.categories,
					req.body?.additionalOptions?.daysAbandonedWorkflow,
				);

				return res.json(result);
			} catch (error) {
				return res.status(500).json(error);
			}
		},
	],
};
