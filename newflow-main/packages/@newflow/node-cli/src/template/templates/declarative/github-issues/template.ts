/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import path from 'node:path';

import { createTemplate } from '../../../core';

export const githubIssuesTemplate = createTemplate({
	name: 'GitHub Issues API',
	description: 'Demo node with multiple operations and credentials',
	path: path.join(__dirname, 'template'),
});
