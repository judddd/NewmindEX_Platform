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
export class DocsConfig {
	/** Base URL for documentation pages */
	@Env('NEWFLOW_DOCS_BASE_URL')
	baseUrl: string = 'https://docs.newflow.io';
}
