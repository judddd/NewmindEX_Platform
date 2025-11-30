/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import CanvasNodeDisabledStrikeThrough from '@/components/canvas/elements/nodes/render-types/parts/CanvasNodeDisabledStrikeThrough.vue';
import { createComponentRenderer } from '@/__tests__/render';

const renderComponent = createComponentRenderer(CanvasNodeDisabledStrikeThrough);

describe('CanvasNodeDisabledStrikeThrough', () => {
	it('should render node correctly', () => {
		const { container } = renderComponent();

		expect(container.firstChild).toHaveClass('disabledStrikeThrough');
	});
});
