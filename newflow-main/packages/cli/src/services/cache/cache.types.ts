/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { MemoryCache } from 'cache-manager';

import type { RedisCache } from '@/services/cache/redis.cache-manager';

export type TaggedRedisCache = RedisCache & { kind: 'redis' };

export type TaggedMemoryCache = MemoryCache & { kind: 'memory' };

export type Hash<T = unknown> = Record<string, T>;

export type MaybeHash<T> = Hash<T> | undefined;
