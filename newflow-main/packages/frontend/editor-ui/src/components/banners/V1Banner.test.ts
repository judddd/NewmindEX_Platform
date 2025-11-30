/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import V1Banner from './V1Banner.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useUsersStore } from '@/stores/users.store';
import { ROLE } from '@newflow/api-types';
import type { IUser } from '@newflow/rest-api-client/api/users';

const renderComponent = createComponentRenderer(V1Banner, {
	global: {
		stubs: {
			N8nIcon: true,
		},
	},
});

describe('V1 Banner', () => {
	let pinia: ReturnType<typeof createPinia>;
	let usersStore: ReturnType<typeof useUsersStore>;

	beforeEach(async () => {
		pinia = createPinia();
		setActivePinia(pinia);

		usersStore = useUsersStore();
	});

	it('should render banner', () => {
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
		expect(container.querySelectorAll('a')).toHaveLength(1);
	});

	it('should render banner with dismiss call if user is owner', () => {
		usersStore.usersById = { '1': { role: ROLE.Owner } as IUser };
		usersStore.currentUserId = '1';

		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
		expect(container.querySelectorAll('a')).toHaveLength(2);
	});
});
