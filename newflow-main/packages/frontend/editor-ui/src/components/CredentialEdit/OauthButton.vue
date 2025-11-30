<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
import GoogleAuthButton from './GoogleAuthButton.vue';

defineProps<{
	isGoogleOAuthType: boolean;
}>();
const i18n = useI18n();
</script>

<template>
	<div :class="$style.container">
		<GoogleAuthButton v-if="isGoogleOAuthType" />
		<n8n-button
			v-else
			:label="i18n.baseText('credentialEdit.oAuthButton.connectMyAccount')"
			size="large"
		/>
	</div>
</template>

<style module lang="scss">
.container {
	display: inline-block;
}
</style>
