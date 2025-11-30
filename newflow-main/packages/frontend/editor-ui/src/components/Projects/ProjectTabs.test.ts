/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createComponentRenderer } from '@/__tests__/render';
import ProjectTabs from '@/components/Projects/ProjectTabs.vue';

vi.mock('vue-router', async () => {
	const actual = await vi.importActual('vue-router');
	const params = {};
	return {
		...actual,
		useRoute: () => ({
			params,
		}),
	};
});
const renderComponent = createComponentRenderer(ProjectTabs, {
	global: {
		stubs: {
			'router-link': {
				template: '<div><slot /></div>',
			},
		},
	},
});

describe('ProjectTabs', () => {
	it('should render home tabs', async () => {
		const { getByText, queryByText } = renderComponent();

		expect(getByText('Workflows')).toBeInTheDocument();
		expect(getByText('Credentials')).toBeInTheDocument();
		expect(getByText('Executions')).toBeInTheDocument();
		expect(queryByText('Project settings')).not.toBeInTheDocument();
	});

	it('should render project tab Settings', () => {
		const { getByText } = renderComponent({ props: { showSettings: true } });

		expect(getByText('Workflows')).toBeInTheDocument();
		expect(getByText('Credentials')).toBeInTheDocument();
		expect(getByText('Executions')).toBeInTheDocument();
		expect(getByText('Project settings')).toBeInTheDocument();
	});
});
