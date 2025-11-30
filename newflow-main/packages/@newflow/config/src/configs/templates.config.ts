/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env } from '../decorators';

@Config
export class TemplatesConfig {
	/** Whether to load workflow templates. */
	@Env('NEWFLOW_TEMPLATES_ENABLED')
	enabled: boolean = false;

	/** Host to retrieve workflow templates from endpoints. */
	@Env('NEWFLOW_TEMPLATES_HOST')
	host: string = 'https://api.newmindtech.cn/api/';
}
