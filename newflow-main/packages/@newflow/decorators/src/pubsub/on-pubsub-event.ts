/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';

import { PubSubMetadata } from './pubsub-metadata';
import type { PubSubEventName, PubSubEventFilter } from './pubsub-metadata';
import { NonMethodError } from '../errors';
import type { EventHandlerClass } from '../types';

/**
 * Decorator that registers a method to be called when a specific PubSub event occurs.
 * Optionally filters event handling based on instance type and role.
 *
 * @param eventName - The PubSub event to listen for
 * @param filter - Optional filter to limit event handling to specific instance types or roles
 *
 * @example
 *
 * ```ts
 * @Service()
 * class MyService {
 *   @OnPubSubEvent('community-package-install', { instanceType: 'main', instanceRole: 'leader' })
 *   async handlePackageInstall() {
 *     // Handle community package installation
 *   }
 * }
 * ```
 */
export const OnPubSubEvent =
	(eventName: PubSubEventName, filter?: PubSubEventFilter): MethodDecorator =>
	(prototype, propertyKey, descriptor) => {
		const eventHandlerClass = prototype.constructor as EventHandlerClass;
		const methodName = String(propertyKey);

		if (typeof descriptor?.value !== 'function') {
			throw new NonMethodError(`${eventHandlerClass.name}.${methodName}()`);
		}

		Container.get(PubSubMetadata).register({
			eventHandlerClass,
			methodName,
			eventName,
			filter,
		});
	};
