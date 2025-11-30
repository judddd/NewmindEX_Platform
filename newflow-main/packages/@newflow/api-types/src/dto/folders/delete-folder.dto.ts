/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Z } from 'zod-class';

import { folderIdSchema } from '../../schemas/folder.schema';

export class DeleteFolderDto extends Z.class({
	transferToFolderId: folderIdSchema.optional(),
}) {}
