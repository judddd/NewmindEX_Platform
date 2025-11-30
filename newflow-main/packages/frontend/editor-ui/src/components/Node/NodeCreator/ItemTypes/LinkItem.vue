<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import type { LinkItemProps } from '@/Interface';

export interface Props {
	link: LinkItemProps;
}

defineProps<Props>();
</script>

<template>
	<n8n-node-creator-node
		:class="$style.creatorLink"
		:title="link.title"
		:is-trigger="false"
		:description="link.description"
		:tag="link.tag"
		:show-action-arrow="true"
	>
		<template #icon>
			<n8n-node-icon
				type="icon"
				:name="link.icon"
				:circle="false"
				:show-tooltip="false"
				:use-updated-icons="true"
			/>
		</template>
	</n8n-node-creator-node>
</template>

<style lang="scss" module>
.creatorLink {
	--action-arrow-color: var(--color-text-light);
	margin-left: var(--spacing-s);
	margin-right: var(--spacing-xs);
}
</style>
