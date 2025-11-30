/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { type IconName } from '@newflow/design-system/components/N8nIcon/icons';

export const ASSIGNMENT_TYPES: Array<{ type: string; icon: IconName }> = [
	{ type: 'string', icon: 'case-upper' },
	{ type: 'number', icon: 'hash' },
	{ type: 'boolean', icon: 'square-check' },
	{ type: 'array', icon: 'list' },
	{ type: 'object', icon: 'box' },
];
