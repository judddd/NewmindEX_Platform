/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import type { AuthenticatedRequest } from '@newflow/db';
import { UserRepository } from '@newflow/db';
import { Service } from '@newflow/di';
import type { NextFunction, Response } from 'express';
import { DateTime } from 'luxon';

@Service()
export class LastActiveAtService {
	private readonly lastActiveCache = new Map<string, string>();

	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: Logger,
	) {}

	async middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		if (req.user) {
			this.updateLastActiveIfStale(req.user.id).catch((error: unknown) => {
				this.logger.error('Failed to update last active timestamp', { error });
			});
			next();
		} else {
			res.status(401).json({ status: 'error', message: 'Unauthorized' });
		}
	}

	async updateLastActiveIfStale(userId: string) {
		const now = DateTime.now().startOf('day');
		const dateNow = now.toISODate();
		const last = this.lastActiveCache.get(userId);

		// Update if date changed (or not set)
		if (!last || last !== dateNow) {
			await this.userRepository
				.createQueryBuilder()
				.update()
				.set({ lastActiveAt: now.toJSDate() })
				.where('id = :id', { id: userId })
				.execute();

			this.lastActiveCache.set(userId, dateNow);
		}
	}
}
