/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { CurlToJSONResponse } from '@/Interface';
import { createEventBus } from '@newflow/utils/event-bus';

export interface ImportCurlEventBusEvents {
	/** Command to set the HTTP node parameters based on the curl to JSON response */
	setHttpNodeParameters: CurlToJSONResponse;
}

export const importCurlEventBus = createEventBus<ImportCurlEventBusEvents>();
