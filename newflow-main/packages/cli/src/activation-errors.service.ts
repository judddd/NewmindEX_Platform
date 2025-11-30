/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';

import { CacheService } from '@/services/cache/cache.service';

@Service()
export class ActivationErrorsService {
	private readonly cacheKey = 'workflow-activation-errors';

	constructor(private readonly cacheService: CacheService) {}

	async register(workflowId: string, errorMessage: string) {
		await this.cacheService.setHash(this.cacheKey, { [workflowId]: errorMessage });
	}

	async deregister(workflowId: string) {
		await this.cacheService.deleteFromHash(this.cacheKey, workflowId);
	}

	async get(workflowId: string) {
		const activationError = await this.cacheService.getHashValue<string>(this.cacheKey, workflowId);

		if (!activationError) return null;

		return activationError;
	}

	async getAll() {
		const activationErrors = await this.cacheService.getHash<string>(this.cacheKey);

		if (!activationErrors) return {};

		return activationErrors;
	}

	async clearAll() {
		await this.cacheService.delete(this.cacheKey);
	}
}
