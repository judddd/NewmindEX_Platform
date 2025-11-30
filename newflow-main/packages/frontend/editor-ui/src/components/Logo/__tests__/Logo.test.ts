/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import Logo from '../Logo.vue';

vi.stubGlobal('URL', {
	createObjectURL: vi.fn(),
});

describe('Logo', () => {
	const renderComponent = createComponentRenderer(Logo);

	it('renders the logo for authView location', () => {
		const wrapper = renderComponent({
			props: { location: 'authView', releaseChannel: 'stable' },
		});
		expect(wrapper.html()).toMatchSnapshot();
	});

	it('renders the logo for sidebar location when sidebar is expanded', () => {
		const wrapper = renderComponent({
			props: { location: 'sidebar', collapsed: false, releaseChannel: 'stable' },
		});
		expect(wrapper.html()).toMatchSnapshot();
	});

	it('renders the logo for sidebar location when sidebar is collapsed', () => {
		const wrapper = renderComponent({
			props: { location: 'sidebar', collapsed: true, releaseChannel: 'stable' },
		});
		expect(wrapper.html()).toMatchSnapshot();
	});
});
