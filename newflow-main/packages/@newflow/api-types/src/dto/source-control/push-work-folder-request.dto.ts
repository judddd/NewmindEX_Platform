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

import { SourceControlledFileSchema } from '../../schemas/source-controlled-file.schema';

export class PushWorkFolderRequestDto extends Z.class({
	force: z.boolean().optional(),
	commitMessage: z.string().optional(),
	fileNames: z.array(SourceControlledFileSchema),
}) {}
