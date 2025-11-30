/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

export const nodeVersionSchema = z
	.number()
	.min(1)
	.refine(
		(val) => {
			const parts = String(val).split('.');
			return (
				(parts.length === 1 && !isNaN(Number(parts[0]))) ||
				(parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1])))
			);
		},
		{
			message: 'Invalid node version. Must be in format: major.minor',
		},
	);
