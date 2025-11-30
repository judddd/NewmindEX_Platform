<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import Modal from '@/components/Modal.vue';
import { useI18n } from '@newflow/i18n';

const props = defineProps<{
	modalName: string;
	data: { title: string; footerButtonAction: () => void };
}>();

const i18n = useI18n();
</script>

<template>
	<Modal width="500px" :title="props.data.title" :name="props.modalName">
		<template #content>
			<n8n-text>
				{{ i18n.baseText('executionsList.debug.paywall.content') }}
				<br />
				<br />
				{{ i18n.baseText('executionsList.debug.paywall.subContent') }}
				<n8n-link :to="i18n.baseText('executionsList.debug.paywall.link.url')" new-window>
					{{ i18n.baseText('executionsList.debug.paywall.link.text') }}
				</n8n-link>
			</n8n-text>
		</template>
		<template #footer>
			<div :class="$style.footer">
				<n8n-button @click="props.data.footerButtonAction">
					{{ i18n.baseText('generic.seePlans') }}
				</n8n-button>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.footer {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
}
</style>
