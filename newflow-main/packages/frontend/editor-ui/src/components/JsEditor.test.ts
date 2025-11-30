/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createTestingPinia } from '@pinia/testing';
import JsEditor from '@/components/JsEditor/JsEditor.vue';
import { renderComponent } from '@/__tests__/render';

describe('JsEditor', () => {
	const renderEditor = (jsonString: string) =>
		renderComponent(JsEditor, {
			global: {
				plugins: [createTestingPinia()],
			},
			props: { modelValue: jsonString },
		});

	it('renders simple js', async () => {
		const modelValue = 'return [1, 2, 3]';
		const result = renderEditor(modelValue);
		expect(result.container.querySelector('.cm-content')?.textContent).toEqual(modelValue);
	});
});
