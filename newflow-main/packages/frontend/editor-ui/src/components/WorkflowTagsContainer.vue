<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import TagsContainer from './TagsContainer.vue';
import { useTagsStore } from '@/stores/tags.store';
import type { ITag } from '@newflow/rest-api-client/api/tags';

interface Props {
	tagIds: string[];
	limit?: number;
	clickable?: boolean;
	responsive?: boolean;
	hoverable?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
	click: [tagId: string];
}>();

const annotationTagsStore = useTagsStore();

const tagsById = computed<Record<string, ITag>>(() => annotationTagsStore.tagsById);

function onClick(tagId: string) {
	emit('click', tagId);
}
</script>

<template>
	<TagsContainer
		:tag-ids="tagIds"
		:tags-by-id="tagsById"
		:limit="limit"
		:clickable="clickable"
		:responsive="responsive"
		:hoverable="hoverable"
		@click="onClick"
	/>
</template>
