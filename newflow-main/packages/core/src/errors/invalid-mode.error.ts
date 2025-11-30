/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ApplicationError } from '@n8n/errors';

import { CONFIG_MODES } from '../binary-data/utils';

export class InvalidModeError extends ApplicationError {
	constructor() {
		super(`Invalid binary data mode. Valid modes: ${CONFIG_MODES.join(', ')}`);
	}
}
