<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { N8nNotice } from '@newflow/design-system';
import { i18n } from '@newflow/i18n';
import { useUIStore } from '@/stores/ui.store';
import { computed } from 'vue';
const noticeStyles = computed(() => {
	const isDark = useUIStore().appliedTheme === 'dark';
	if (isDark) {
		return {
			borderColor: 'var(--color-callout-secondary-border)',
			backgroundColor: 'var(--color-callout-secondary-background)',
			color: 'var(--color-callout-secondary-font)',
		};
	}
	return {
		borderColor: 'var(--color-secondary)',
		backgroundColor: 'var(--color-secondary-tint-3)',
	};
});
</script>

<template>
	<N8nNotice
		theme="info"
		:style="{
			marginTop: '0',
			...noticeStyles,
		}"
	>
		{{ i18n.baseText('communityNodeUpdateInfo.available') }}
	</N8nNotice>
</template>
