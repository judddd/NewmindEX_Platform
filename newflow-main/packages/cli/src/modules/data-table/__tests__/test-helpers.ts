/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';

import { DataStoreSizeValidator } from '../data-store-size-validator.service';

export function mockDataStoreSizeValidator() {
	const sizeValidator = Container.get(DataStoreSizeValidator);
	jest.spyOn(sizeValidator, 'validateSize').mockResolvedValue();
	jest.spyOn(sizeValidator, 'getCachedSizeData').mockResolvedValue({
		totalBytes: 50 * 1024 * 1024, // 50MB - under the default limit
		dataTables: {},
	});
	return sizeValidator;
}
