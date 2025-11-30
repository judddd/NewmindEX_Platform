<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
import { usePageRedirectionHelper } from '@/composables/usePageRedirectionHelper';

const pageRedirectionHelper = usePageRedirectionHelper();
const i18n = useI18n();

const goToUpgrade = async () => {
	await pageRedirectionHelper.goToUpgrade('insights', 'upgrade-insights');
};
</script>

<template>
	<div :class="$style.callout">
		<N8nIcon icon="lock" size="xlarge"></N8nIcon>
		<N8nText bold tag="h4" size="large">
			{{ i18n.baseText('insights.dashboard.paywall.title') }}
		</N8nText>
		<N8nText>
			{{ i18n.baseText('insights.dashboard.paywall.description') }}
		</N8nText>
		<N8nButton type="primary" native-type="button" size="large" @click="goToUpgrade">
			{{ i18n.baseText('generic.upgrade') }}
		</N8nButton>
	</div>
</template>

<style lang="scss" module>
.callout {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 6rem 0;
	align-items: center;
	max-width: 360px;
	margin: 0 auto;
	text-align: center;
	gap: 10px;
	justify-content: center;
}
</style>
