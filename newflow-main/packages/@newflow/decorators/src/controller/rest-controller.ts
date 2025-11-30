/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container, Service } from '@newflow/di';

import { ControllerRegistryMetadata } from './controller-registry-metadata';
import type { Controller } from './types';

export const RestController =
	(basePath: `/${string}` = '/'): ClassDecorator =>
	(target) => {
		const metadata = Container.get(ControllerRegistryMetadata).getControllerMetadata(
			target as unknown as Controller,
		);
		metadata.basePath = basePath;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return Service()(target);
	};
