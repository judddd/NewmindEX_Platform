<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script lang="ts" setup>
import { useI18n } from '@newflow/i18n';
const i18 = useI18n();
</script>

<template>
	<div>
		<a data-action="reload">{{ i18.baseText('nodeView.refresh') }}</a>
		{{ i18.baseText('nodeView.toSeeTheLatestStatus') }}.
		<br />
		<a
			href="https://docs.newflow.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/"
			target="_blank"
		>
			{{ i18.baseText('nodeView.moreInfo') }}
		</a>
	</div>
</template>
