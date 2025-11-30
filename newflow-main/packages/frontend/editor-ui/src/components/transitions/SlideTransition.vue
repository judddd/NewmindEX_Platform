<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<template>
	<transition name="slide">
		<slot />
	</transition>
</template>

<style lang="scss" scoped>
.slide-leave-active,
.slide-enter-active {
	// Keep this in sync with ASK_AI_SLIDE_OUT_DURATION_MS
	transition: 200ms ease;
}
.slide-leave-to,
.slide-enter-from {
	transform: translateX(100%);
}
</style>
