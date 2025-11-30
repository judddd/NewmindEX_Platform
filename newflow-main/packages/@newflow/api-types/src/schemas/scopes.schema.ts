/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ApiKeyScope } from '@newflow/permissions';
import { z } from 'zod';

export const scopesSchema = z
	.array(
		z
			.string()
			.regex(
				/^[a-zA-Z]+:[a-zA-Z]+$/,
				"Each scope must follow the format '{resource}:{scope}' with only letters (e.g., 'workflow:create')",
			),
	)
	.min(1)
	.transform((scopes) => {
		return scopes as ApiKeyScope[];
	});
