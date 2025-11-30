/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import { createTestingPinia } from '@pinia/testing';
import CollectionParameter from './CollectionParameter.vue';

const renderComponent = createComponentRenderer(CollectionParameter, {
	pinia: createTestingPinia(),
});

describe('CollectionParameter', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should render collection options correctly', async () => {
		const { getAllByTestId } = renderComponent({
			props: {
				path: 'parameters.additionalFields',
				parameter: {
					displayName: 'Additional Fields',
					name: 'additionalFields',
					type: 'collection',
					options: [
						{
							displayName: 'Currency',
							name: 'currency',
							type: 'string',
							default: 'USD',
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'number',
						},
					],
				},
				nodeValues: {
					parameters: {
						additionalFields: {},
					},
				},
			},
		});

		const options = getAllByTestId('collection-parameter-option');
		expect(options.length).toBe(2);
		expect(options.at(0)).toHaveTextContent('Currency');
		expect(options.at(1)).toHaveTextContent('Value');
	});
});
