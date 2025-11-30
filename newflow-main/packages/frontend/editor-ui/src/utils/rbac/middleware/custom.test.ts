/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { customMiddleware } from '@/utils/rbac/middleware/custom';
import type { RouteLocationNormalized } from 'vue-router';
import { VIEWS } from '@/constants';

describe('Middleware', () => {
	describe('custom', () => {
		it('should redirect to homepage if validation function returns false', async () => {
			const nextMock = vi.fn();
			const fn = () => false;

			await customMiddleware(
				{} as RouteLocationNormalized,
				{} as RouteLocationNormalized,
				nextMock,
				fn,
			);

			expect(nextMock).toHaveBeenCalledWith({ name: VIEWS.HOMEPAGE });
		});

		it('should pass if validation function returns true', async () => {
			const nextMock = vi.fn();
			const fn = () => true;

			await customMiddleware(
				{} as RouteLocationNormalized,
				{} as RouteLocationNormalized,
				nextMock,
				fn,
			);

			expect(nextMock).not.toHaveBeenCalled();
		});
	});
});
