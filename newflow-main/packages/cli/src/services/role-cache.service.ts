/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import { Time } from '@newflow/constants';
import { RoleRepository } from '@newflow/db';
import { Container, Service } from '@newflow/di';
import { staticRolesWithScope, type Scope } from '@newflow/permissions';

import { CacheService } from './cache/cache.service';

type RoleInfo = {
	scopes: string[]; // array of scope slugs
};

interface RoleScopeMap {
	global?: {
		[roleSlug: string]: RoleInfo;
	};
	project?: {
		[roleSlug: string]: RoleInfo;
	};
	credential?: {
		[roleSlug: string]: RoleInfo;
	};
	workflow?: {
		[roleSlug: string]: RoleInfo;
	};
}

@Service()
export class RoleCacheService {
	private static readonly CACHE_KEY = 'roles:scope-map';
	private static readonly CACHE_TTL = 5 * Time.minutes.toMilliseconds; // 5 minutes TTL

	constructor(
		private readonly cacheService: CacheService,
		private readonly logger: Logger,
	) {}

	/**
	 * Get all roles from database and build scope map
	 */
	private async buildRoleScopeMap(): Promise<RoleScopeMap> {
		try {
			const roleRepository = Container.get(RoleRepository);
			const roles = await roleRepository.findAll();

			const roleScopeMap: RoleScopeMap = {};
			for (const role of roles) {
				roleScopeMap[role.roleType] ??= {};
				roleScopeMap[role.roleType]![role.slug] = {
					scopes: role.scopes.map((s) => s.slug),
				};
			}

			return roleScopeMap;
		} catch (error) {
			this.logger.error('Failed to build role scope from database', { error });
			throw error;
		}
	}

	/**
	 * Get roles with all specified scopes (with caching)
	 */
	async getRolesWithAllScopes(
		namespace: 'global' | 'project' | 'credential' | 'workflow',
		requiredScopes: Scope[],
	): Promise<string[]> {
		if (requiredScopes.length === 0) return [];

		// Get cached role map with refresh function
		const roleScopeMap = await this.cacheService.get<RoleScopeMap>(RoleCacheService.CACHE_KEY, {
			refreshFn: async () => await this.buildRoleScopeMap(),
			fallbackValue: undefined,
		});

		if (roleScopeMap === undefined) {
			// TODO: actively report this case to sentry or similar system
			this.logger.error('Role scope map is undefined, falling back to static roles');
			// Fallback to static roles if dynamic data is not available
			return staticRolesWithScope(namespace, requiredScopes);
		}

		// Filter roles by namespace and scopes
		const matchingRoles: string[] = [];

		for (const [roleSlug, roleInfo] of Object.entries(roleScopeMap[namespace] ?? {})) {
			// Check if role has ALL required scopes
			const hasAllScopes = requiredScopes.every((scope) => roleInfo.scopes.includes(scope));
			if (hasAllScopes) {
				matchingRoles.push(roleSlug);
			}
		}

		return matchingRoles;
	}

	/**
	 * Invalidate the role cache (call after role changes)
	 */
	async invalidateCache(): Promise<void> {
		await this.cacheService.delete(RoleCacheService.CACHE_KEY);
	}

	/**
	 * Force refresh the cache
	 */
	async refreshCache(): Promise<void> {
		const roleScopeMap = await this.buildRoleScopeMap();
		await this.cacheService.set(
			RoleCacheService.CACHE_KEY,
			roleScopeMap,
			RoleCacheService.CACHE_TTL,
		);
	}
}
