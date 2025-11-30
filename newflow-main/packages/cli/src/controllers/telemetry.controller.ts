/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Get, Post, RestController } from '@newflow/decorators';
import { Response } from 'express';

@RestController('/telemetry')
export class TelemetryController {
	// NewFlow: All telemetry endpoints are stubbed - no external telemetry service

	@Post('/proxy/:version/track', { skipAuth: true, rateLimit: { limit: 100, windowMs: 60_000 } })
	async track(_req: any, res: Response) {
		// Stub: Accept but don't process telemetry data
		res.status(200).json({ success: true });
	}

	@Post('/proxy/:version/identify', { skipAuth: true, rateLimit: true })
	async identify(_req: any, res: Response) {
		// Stub: Accept but don't process telemetry data
		res.status(200).json({ success: true });
	}

	@Post('/proxy/:version/page', { skipAuth: true, rateLimit: { limit: 50, windowMs: 60_000 } })
	async page(_req: any, res: Response) {
		// Stub: Accept but don't process telemetry data
		res.status(200).json({ success: true });
	}
	@Get('/rudderstack/sourceConfig', {
		skipAuth: true,
		rateLimit: { limit: 50, windowMs: 60_000 },
		usesTemplates: true,
	})
	async sourceConfig(_: Request, res: Response) {
		// NewFlow: Stub - no external telemetry service
		const config: unknown = {
			source: {
				config: {},
				enabled: false,
			},
		};

		// write directly to response to avoid wrapping the config in `data` key which is not expected by RudderStack sdk
		res.json(config);
	}
}
