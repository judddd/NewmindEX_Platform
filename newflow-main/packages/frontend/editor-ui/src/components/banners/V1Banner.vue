<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import BaseBanner from '@/components/banners/BaseBanner.vue';
import { i18n as locale } from '@newflow/i18n';
import { hasPermission } from '@/utils/rbac/permissions';
import { useUIStore } from '@/stores/ui.store';

const uiStore = useUIStore();

async function dismissPermanently() {
	await uiStore.dismissBanner('V1', 'permanent');
}

const hasOwnerPermission = computed(() => hasPermission(['instanceOwner']));
</script>

<template>
	<BaseBanner custom-icon="info" theme="warning" name="V1" :class="$style.v1container">
		<template #mainContent>
			<span v-n8n-html="locale.baseText('banners.v1.message')"></span>
			<a
				v-if="hasOwnerPermission"
				:class="$style.link"
				data-test-id="banner-confirm-v1"
				@click="dismissPermanently"
			>
				<span v-n8n-html="locale.baseText('generic.dontShowAgain')"></span>
			</a>
		</template>
	</BaseBanner>
</template>

<style lang="scss" module>
.v1container {
	a,
	.link {
		font-weight: var(--font-weight-bold);
		text-decoration: underline;
	}
}
</style>
