/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Plugin } from 'vue';

import 'regenerator-runtime/runtime';

import ElementPlus, { ElLoading, ElMessageBox } from 'element-plus';
import { N8nPlugin } from '@newflow/design-system';
import { useMessage } from '@/composables/useMessage';
import EnterpriseEdition from '@/components/FeatureToggle.vue';
import ParameterInputList from '@/components/ParameterInputList.vue';

export const GlobalComponentsPlugin: Plugin = {
	install(app) {
		const messageService = useMessage();

		app.component('EnterpriseEdition', EnterpriseEdition);
		app.component('ParameterInputList', ParameterInputList);

		app.use(ElementPlus);
		app.use(N8nPlugin, {});

		// app.use(ElLoading);
		// app.use(ElNotification);

		app.config.globalProperties.$loading = ElLoading.service;
		app.config.globalProperties.$msgbox = ElMessageBox;
		app.config.globalProperties.$alert = messageService.alert;
		app.config.globalProperties.$confirm = messageService.confirm;
		app.config.globalProperties.$prompt = messageService.prompt;
		app.config.globalProperties.$message = messageService.message;
	},
};
