<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<template>
	<div :class="$style.wrapper" data-test-id="node-view-loader">
		<div :class="$style.spinner">
			<n8n-spinner />
		</div>
	</div>
</template>

<style lang="scss" module>
.wrapper {
	width: 100%;
	height: 100%;
	position: absolute;
	background-color: var(--color-background-light);
}

.spinner {
	margin-bottom: var(--spacing-l);
	position: absolute;
	left: 50%;
	top: 30%;

	* {
		color: var(--color-primary);
		min-height: 40px;
		min-width: 40px;
	}
}
</style>
