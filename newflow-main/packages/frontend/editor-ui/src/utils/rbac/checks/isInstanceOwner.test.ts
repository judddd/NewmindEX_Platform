/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useUsersStore } from '@/stores/users.store';
import { isInstanceOwner } from '@/utils/rbac/checks/isInstanceOwner';

vi.mock('@/stores/users.store', () => ({
	useUsersStore: vi.fn(),
}));

describe('Checks', () => {
	describe('isInstanceOwner()', () => {
		it('should return false if user not logged in', () => {
			vi.mocked(useUsersStore).mockReturnValue({ isInstanceOwner: false } as ReturnType<
				typeof useUsersStore
			>);

			expect(isInstanceOwner()).toBe(false);
		});

		it('should return true if user is default user', () => {
			vi.mocked(useUsersStore).mockReturnValue({ isInstanceOwner: true } as unknown as ReturnType<
				typeof useUsersStore
			>);

			expect(isInstanceOwner()).toBe(true);
		});
	});
});
