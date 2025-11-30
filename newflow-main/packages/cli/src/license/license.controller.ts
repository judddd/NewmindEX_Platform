/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Get, RestController } from '@newflow/decorators';

import { LicenseService } from './license.service';

@RestController('/license')
export class LicenseController {
	constructor(private readonly licenseService: LicenseService) {}

	@Get('/')
	async getLicenseData() {
		return await this.licenseService.getLicenseData();
	}
}
