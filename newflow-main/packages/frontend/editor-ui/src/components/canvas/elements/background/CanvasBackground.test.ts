/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import CanvasBackground from '@/components/canvas/elements/background/CanvasBackground.vue';

const renderComponent = createComponentRenderer(CanvasBackground);

describe('CanvasBackground', () => {
	it('should render the background with the correct gap', () => {
		const { getByTestId, html } = renderComponent({
			props: { striped: false, viewport: { x: 0, y: 0, zoom: 1 } },
		});
		const background = getByTestId('canvas-background');

		expect(background).toBeInTheDocument();
		expect(html()).toMatchSnapshot();
	});

	it('should render the striped pattern when striped is true', () => {
		const { getByTestId } = renderComponent({
			props: { striped: true, viewport: { x: 0, y: 0, zoom: 1 } },
		});
		const pattern = getByTestId('canvas-background-striped-pattern');

		expect(pattern).toBeInTheDocument();
	});

	it('should not render the striped pattern when striped is false', () => {
		const { getByTestId } = renderComponent({
			props: { striped: false, viewport: { x: 0, y: 0, zoom: 1 } },
		});

		expect(() => getByTestId('canvas-background-striped-pattern')).toThrow();
	});
});
