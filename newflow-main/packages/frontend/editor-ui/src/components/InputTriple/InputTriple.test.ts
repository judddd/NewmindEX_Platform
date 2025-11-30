/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import InputTriple from './InputTriple.vue';

const renderComponent = createComponentRenderer(InputTriple);

describe('InputTriple.vue', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders layout correctly', async () => {
		const { container } = renderComponent({
			props: { middleWidth: '200px' },
			slots: {
				left: '<div>left</div>',
				middle: '<div>middle</div>',
				right: '<div>right</div>',
			},
		});

		expect(container.querySelector('.triple')).toBeInTheDocument();
		expect(container.querySelectorAll('.item')).toHaveLength(3);
		expect(container.querySelector('.middle')).toHaveStyle('flex-basis: 200px');
	});

	it('does not render missing slots', async () => {
		const { container } = renderComponent({
			props: { middleWidth: '200px' },
			slots: {
				left: '<div>left</div>',
				middle: '<div>middle</div>',
			},
		});

		expect(container.querySelector('.triple')).toBeInTheDocument();
		expect(container.querySelectorAll('.item')).toHaveLength(2);
	});
});
