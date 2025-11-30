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

import { CreateDataStoreColumnDto } from './create-data-store-column.dto';
import { dataStoreNameSchema } from '../../schemas/data-store.schema';

export class CreateDataStoreDto extends Z.class({
	name: dataStoreNameSchema,
	columns: z.array(CreateDataStoreColumnDto),
}) {}
