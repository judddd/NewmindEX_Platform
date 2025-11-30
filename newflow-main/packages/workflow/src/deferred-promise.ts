/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

type ResolveFn<T> = (result: T | PromiseLike<T>) => void;
type RejectFn = (error: Error) => void;

export interface IDeferredPromise<T> {
	promise: Promise<T>;
	resolve: ResolveFn<T>;
	reject: RejectFn;
}

export function createDeferredPromise<T = void>(): IDeferredPromise<T> {
	const deferred: Partial<IDeferredPromise<T>> = {};
	deferred.promise = new Promise<T>((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	return deferred as IDeferredPromise<T>;
}
