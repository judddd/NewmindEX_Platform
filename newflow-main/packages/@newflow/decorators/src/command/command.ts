/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container, Service } from '@newflow/di';

import { CommandMetadata } from './command-metadata';
import type { CommandClass, CommandOptions } from './types';

export const Command =
	({ name, description, examples, flagsSchema }: CommandOptions): ClassDecorator =>
	(target) => {
		const commandClass = target as unknown as CommandClass;
		Container.get(CommandMetadata).register(name, {
			description,
			flagsSchema,
			class: commandClass,
			examples,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return Service()(target);
	};
