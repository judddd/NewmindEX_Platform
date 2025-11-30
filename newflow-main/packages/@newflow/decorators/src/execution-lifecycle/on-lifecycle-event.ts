/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';

import type { LifecycleEvent, LifecycleHandlerClass } from './lifecycle-metadata';
import { LifecycleMetadata } from './lifecycle-metadata';
import { NonMethodError } from '../errors';

/**
 * Decorator that registers a method to be called when a specific lifecycle event occurs.
 * For more information, see `execution-lifecycle-hooks.ts` in `cli` and `core`.
 *
 * @example
 *
 * ```ts
 * @Service()
 * class MyService {
 *   @OnLifecycleEvent('workflowExecuteAfter')
 *   async handleEvent(ctx: WorkflowExecuteAfterContext) {
 *     // ...
 *   }
 * }
 * ```
 */
export const OnLifecycleEvent =
	(eventName: LifecycleEvent): MethodDecorator =>
	(prototype, propertyKey, descriptor) => {
		const handlerClass = prototype.constructor as LifecycleHandlerClass;
		const methodName = String(propertyKey);

		if (typeof descriptor?.value !== 'function') {
			throw new NonMethodError(`${handlerClass.name}.${methodName}()`);
		}

		Container.get(LifecycleMetadata).register({
			handlerClass,
			methodName,
			eventName,
		});
	};
