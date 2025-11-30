/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { fireEvent } from '@testing-library/vue';
import CanvasEdgeToolbar from './CanvasEdgeToolbar.vue';
import { createComponentRenderer } from '@/__tests__/render';

const renderComponent = createComponentRenderer(CanvasEdgeToolbar);

describe('CanvasEdgeToolbar', () => {
	it('should emit delete event when delete button is clicked', async () => {
		const { getByTestId, emitted } = renderComponent();
		const deleteButton = getByTestId('delete-connection-button');

		await fireEvent.click(deleteButton);

		expect(emitted()).toHaveProperty('delete');
	});
});
