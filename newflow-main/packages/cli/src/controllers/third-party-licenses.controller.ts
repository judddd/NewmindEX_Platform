/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { CLI_DIR } from '@/constants';
import { Get, RestController } from '@newflow/decorators';
import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

@RestController('/third-party-licenses')
export class ThirdPartyLicensesController {
	/**
	 * Get third-party licenses content
	 * Requires authentication to access
	 */
	@Get('/')
	async getThirdPartyLicenses(_: Request, res: Response) {
		const licenseFile = resolve(CLI_DIR, 'THIRD_PARTY_LICENSES.md');

		try {
			const content = await readFile(licenseFile, 'utf-8');
			res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
			res.send(content);
		} catch {
			res.status(404).send('Third-party licenses file not found');
		}
	}
}
