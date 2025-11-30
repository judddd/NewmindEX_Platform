import { defineBackendExtension } from '@newflow/extension-sdk/backend';

export default defineBackendExtension({
	setup(n8n) {
		console.log(n8n);
	},
});
