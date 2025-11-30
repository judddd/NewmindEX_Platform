/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	LineController,
} from 'chart.js';

export const ChartJSPlugin = {
	install: () => {
		ChartJS.register(
			CategoryScale,
			LinearScale,
			BarElement,
			LineElement,
			PointElement,
			Title,
			Tooltip,
			Legend,
			LineController,
		);
	},
};
