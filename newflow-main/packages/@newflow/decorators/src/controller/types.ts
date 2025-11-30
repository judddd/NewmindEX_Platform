/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { BooleanLicenseFeature } from '@newflow/constants';
import type { Constructable } from '@newflow/di';
import type { Scope } from '@newflow/permissions';
import type { RequestHandler } from 'express';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type Arg = { type: 'body' | 'query' } | { type: 'param'; key: string };

export interface RateLimit {
	/**
	 * The maximum number of requests to allow during the `window` before rate limiting the client.
	 * @default 5
	 */
	limit?: number;
	/**
	 * How long we should remember the requests.
	 * @default 300_000 (5 minutes)
	 */
	windowMs?: number;
}

export type HandlerName = string;

export interface AccessScope {
	scope: Scope;
	globalOnly: boolean;
}

export interface RouteMetadata {
	method: Method;
	path: string;
	middlewares: RequestHandler[];
	usesTemplates: boolean;
	skipAuth: boolean;
	allowSkipMFA: boolean;
	rateLimit?: boolean | RateLimit;
	licenseFeature?: BooleanLicenseFeature;
	accessScope?: AccessScope;
	args: Arg[];
}

export interface ControllerMetadata {
	basePath: `/${string}`;
	middlewares: HandlerName[];
	routes: Map<HandlerName, RouteMetadata>;
}

export type Controller = Constructable<object> &
	Record<HandlerName, (...args: unknown[]) => Promise<unknown>>;
