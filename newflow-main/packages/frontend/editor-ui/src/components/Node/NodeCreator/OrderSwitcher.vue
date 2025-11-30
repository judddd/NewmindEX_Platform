<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import type { NodeFilterType } from '@/Interface';
import { REGULAR_NODE_CREATOR_VIEW } from '@/constants';

defineProps<{
	rootView: NodeFilterType;
}>();
</script>

<template>
	<div>
		<template v-if="rootView === REGULAR_NODE_CREATOR_VIEW">
			<slot name="actions" />
			<slot name="triggers" />
		</template>
		<template v-else>
			<slot name="triggers" />
			<slot name="actions" />
		</template>
	</div>
</template>
