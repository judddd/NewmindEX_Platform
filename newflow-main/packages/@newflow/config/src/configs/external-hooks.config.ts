/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ColonSeparatedStringArray } from '../custom-types';
import { Config, Env } from '../decorators';

@Config
export class ExternalHooksConfig {
	/** Files containing external hooks. Multiple files can be separated by colon (":") */
	@Env('EXTERNAL_HOOK_FILES')
	files: ColonSeparatedStringArray = [];
}
