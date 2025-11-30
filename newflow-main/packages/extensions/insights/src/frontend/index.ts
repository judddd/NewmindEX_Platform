import { markRaw } from 'vue';
import { defineFrontendExtension } from '@newflow/extension-sdk/frontend';
import InsightsDashboard from './InsightsDashboard.vue';

export default defineFrontendExtension({
	setup(n8n) {
		n8n.registerComponent('InsightsDashboard', markRaw(InsightsDashboard));
	},
});
