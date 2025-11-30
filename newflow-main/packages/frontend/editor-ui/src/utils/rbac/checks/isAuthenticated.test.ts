/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useUsersStore } from '@/stores/users.store';
import { isAuthenticated } from '@/utils/rbac/checks/isAuthenticated';
import type { IUser } from '@newflow/rest-api-client/api/users';

vi.mock('@/stores/users.store', () => ({
	useUsersStore: vi.fn(),
}));

describe('Checks', () => {
	describe('isAuthenticated()', () => {
		const mockUser: Partial<IUser> = { id: 'user123', fullName: 'Test User' };

		it('should return true if there is a current user', () => {
			vi.mocked(useUsersStore).mockReturnValue({ currentUser: mockUser } as unknown as ReturnType<
				typeof useUsersStore
			>);

			expect(isAuthenticated()).toBe(true);
		});

		it('should return false if there is no current user', () => {
			vi.mocked(useUsersStore).mockReturnValue({ currentUser: null } as ReturnType<
				typeof useUsersStore
			>);

			expect(isAuthenticated()).toBe(false);
		});

		it('should return true if there is a current user and bypass returns false', () => {
			vi.mocked(useUsersStore).mockReturnValue({ currentUser: mockUser } as ReturnType<
				typeof useUsersStore
			>);

			expect(isAuthenticated({ bypass: () => false })).toBe(true);
		});

		it('should return true if there is no current user and bypass returns true', () => {
			vi.mocked(useUsersStore).mockReturnValue({ currentUser: null } as ReturnType<
				typeof useUsersStore
			>);

			expect(isAuthenticated({ bypass: () => true })).toBe(true);
		});

		it('should return false if there is no current user and bypass returns false', () => {
			vi.mocked(useUsersStore).mockReturnValue({ currentUser: null } as ReturnType<
				typeof useUsersStore
			>);

			expect(isAuthenticated({ bypass: () => false })).toBe(false);
		});
	});
});
