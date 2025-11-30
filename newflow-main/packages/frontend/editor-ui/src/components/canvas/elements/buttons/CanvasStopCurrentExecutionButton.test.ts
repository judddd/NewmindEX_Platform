/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import CanvasStopCurrentExecutionButton from './CanvasStopCurrentExecutionButton.vue';

const renderComponent = createComponentRenderer(CanvasStopCurrentExecutionButton, {
	global: {
		stubs: {
			N8nIconButton: true,
		},
	},
});

describe('CanvasStopCurrentExecutionButton', () => {
	it('should render correctly', () => {
		const wrapper = renderComponent();

		expect(wrapper.html()).toMatchSnapshot();
	});

	it('should render different title when loading', () => {
		const wrapper = renderComponent({
			props: {
				stopping: true,
			},
		});

		expect(wrapper.getByTitle('Stopping current execution')).toBeInTheDocument();
	});
});
