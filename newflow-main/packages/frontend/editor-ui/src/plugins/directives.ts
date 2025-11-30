/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Plugin } from 'vue';
import VueTouchEvents from 'vue3-touch-events';

export const GlobalDirectivesPlugin: Plugin = {
	install(app) {
		app.use(VueTouchEvents);
	},
};
