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

import { folderIdSchema } from '../../schemas/folder.schema';

export class TransferFolderBodyDto extends Z.class({
	destinationProjectId: z.string(),
	shareCredentials: z.array(z.string()).optional(),
	destinationParentFolderId: folderIdSchema,
}) {}
