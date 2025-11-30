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
export class HiringBannerConfig {
	/** Whether hiring banner in browser console is enabled. */
	@Env('NEWFLOW_HIRING_BANNER_ENABLED')
	enabled: boolean = true;
}
