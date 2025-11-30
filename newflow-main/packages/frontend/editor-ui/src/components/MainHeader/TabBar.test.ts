/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { fireEvent } from '@testing-library/vue';
import { createComponentRenderer } from '@/__tests__/render';
import TabBar from '@/components/MainHeader/TabBar.vue';

const renderComponent = createComponentRenderer(TabBar);

describe('TabBar', () => {
	const items = [
		{ name: 'Workflow', value: 'workflow' },
		{ name: 'Executions', value: 'executions' },
	];

	it('should render the correct number of tabs', async () => {
		const { findAllByRole } = renderComponent({
			props: {
				items,
				modelValue: 'workflow',
			},
		});

		const tabs = await findAllByRole('radio');
		expect(tabs.length).toBe(2);
	});

	it('should emit update:modelValue event when a tab is clicked', async () => {
		const { findAllByRole, emitted } = renderComponent({
			props: {
				items,
				modelValue: 'workflow',
			},
		});

		const tabs = await findAllByRole('radio');
		const executionsTab = tabs[1];

		await fireEvent.click(executionsTab);

		expect(emitted()).toHaveProperty('update:modelValue');
	});

	it('should update the active tab when modelValue prop changes', async () => {
		const { findAllByRole, rerender } = renderComponent({
			props: {
				items,
				modelValue: 'workflow',
			},
		});

		await rerender({ modelValue: 'executions' });

		const tabs = await findAllByRole('radio');
		const executionsTab = tabs[1];
		const executionsTabButton = executionsTab.querySelector('.button');

		expect(executionsTabButton).toHaveClass('active');
	});
});
