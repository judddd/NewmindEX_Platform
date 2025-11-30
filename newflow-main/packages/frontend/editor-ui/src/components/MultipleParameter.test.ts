/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createTestingPinia } from '@pinia/testing';

import { createComponentRenderer } from '@/__tests__/render';
import MultipleParameter from './MultipleParameter.vue';

describe('MultipleParameter', () => {
	const renderComponent = createComponentRenderer(MultipleParameter, {
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
			values: [],
			isReadOnly: false,
		},
		pinia: createTestingPinia({ initialState: {} }),
	});

	it('should render correctly', () => {
		const wrapper = renderComponent();

		expect(wrapper.html()).toMatchSnapshot();
	});
});
