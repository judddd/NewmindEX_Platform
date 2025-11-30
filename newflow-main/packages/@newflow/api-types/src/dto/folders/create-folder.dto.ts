/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Z } from 'zod-class';

import { folderNameSchema, folderIdSchema } from '../../schemas/folder.schema';

export class CreateFolderDto extends Z.class({
	name: folderNameSchema,
	parentFolderId: folderIdSchema.optional(),
}) {}
