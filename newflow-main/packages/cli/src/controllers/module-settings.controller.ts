/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Get, RestController } from '@newflow/decorators';

import { FrontendService } from '@/services/frontend.service';

@RestController('/module-settings')
export class ModuleSettingsController {
	constructor(private readonly frontendService: FrontendService) {}

	/**
	 * @returns settings for all loaded modules
	 */
	@Get('/')
	getModuleSettings() {
		return this.frontendService.getModuleSettings();
	}
}
