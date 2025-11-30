/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createTestingPinia } from '@pinia/testing';
import ChangePasswordModal from '@/components/ChangePasswordModal.vue';
import type { createPinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';

const renderComponent = createComponentRenderer(ChangePasswordModal);

describe('ChangePasswordModal', () => {
	let pinia: ReturnType<typeof createPinia>;

	beforeEach(() => {
		pinia = createTestingPinia({});
	});

	it('should render correctly', () => {
		const wrapper = renderComponent({ pinia });

		expect(wrapper.html()).toMatchSnapshot();
	});
});
