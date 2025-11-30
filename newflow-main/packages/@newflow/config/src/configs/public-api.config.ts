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
export class PublicApiConfig {
	/** Whether to disable the Public API */
	@Env('NEWFLOW_PUBLIC_API_DISABLED')
	disabled: boolean = false;

	/** Path segment for the Public API */
	@Env('NEWFLOW_PUBLIC_API_ENDPOINT')
	path: string = 'api';

	/** Whether to disable the Swagger UI for the Public API */
	@Env('NEWFLOW_PUBLIC_API_SWAGGERUI_DISABLED')
	swaggerUiDisabled: boolean = false;
}
