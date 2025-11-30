<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { computed } from 'vue';
import { type UsersList } from '@newflow/api-types';
import { useI18n } from '@newflow/i18n';
import { formatTimeAgo } from '@/utils/formatters/dateFormatter';

const i18n = useI18n();

const props = defineProps<{ data: UsersList['items'][number] }>();
const formattedDate = computed(() =>
	props.data.lastActiveAt ? formatTimeAgo(props.data.lastActiveAt) : i18n.baseText('generic.never'),
);
</script>

<template>
	<span>{{ formattedDate }}</span>
</template>
