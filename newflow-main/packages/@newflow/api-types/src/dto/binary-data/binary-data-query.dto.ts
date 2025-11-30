/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';
import { Z } from 'zod-class';

export class BinaryDataQueryDto extends Z.class({
	id: z
		.string()
		.refine((id) => id.includes(':'), {
			message: 'Missing binary data mode',
		})
		.refine(
			(id) => {
				const [mode] = id.split(':');
				return ['filesystem', 'filesystem-v2', 's3'].includes(mode);
			},
			{
				message: 'Invalid binary data mode',
			},
		),
	action: z.enum(['view', 'download']),
	fileName: z.string().optional(),
	mimeType: z.string().optional(),
}) {}
