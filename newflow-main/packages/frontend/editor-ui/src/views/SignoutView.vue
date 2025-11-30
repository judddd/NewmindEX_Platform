<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
import { VIEWS } from '@/constants';
import { useUsersStore } from '@/stores/users.store';
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';
import { useI18n } from '@newflow/i18n';
import { onMounted } from 'vue';

const usersStore = useUsersStore();
const toast = useToast();
const router = useRouter();
const i18n = useI18n();

const logout = async () => {
	try {
		await usersStore.logout();
		window.location.href = router.resolve({ name: VIEWS.SIGNIN }).href;
	} catch (e) {
		toast.showError(e, i18n.baseText('auth.signout.error'));
	}
};

onMounted(() => {
	void logout();
});
</script>

<template>
	<div />
</template>
