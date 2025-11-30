/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import debounce from 'lodash/debounce';

/**
 * Debounce a class method using `lodash/debounce`.
 *
 * @param waitMs - Number of milliseconds to debounce method by.
 *
 * @example
 * ```
 * class MyClass {
 *   @Debounce(1000)
 *   async myMethod() {
 *     // debounced
 *   }
 * }
 * ```
 */
export const Debounce =
	(waitMs: number): MethodDecorator =>
	<T>(
		_: object,
		methodName: string | symbol,
		originalDescriptor: PropertyDescriptor,
	): TypedPropertyDescriptor<T> => ({
		configurable: true,

		get() {
			const debouncedFn = debounce(originalDescriptor.value, waitMs);

			Object.defineProperty(this, methodName, {
				configurable: false,
				value: debouncedFn,
			});

			return debouncedFn as T;
		},
	});
