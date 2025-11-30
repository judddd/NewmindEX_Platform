<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

<script setup lang="ts">
/**
 * Feature Toggle Component
 *
 * A simple conditional rendering component that controls the visibility of features
 * based on specified feature flags. This component acts as a wrapper that shows or
 * hides its content depending on feature availability.
 *
 * In this version, all features are enabled by default, making this component
 * primarily serve as a compatibility layer for existing code that expects
 * feature toggle functionality.
 *
 * Usage:
 * ```vue
 * <FeatureToggle :features="['workflow-sharing', 'advanced-permissions']">
 *   <template #default>
 *     <!-- Content to show when features are enabled -->
 *     <MyFeatureComponent />
 *   </template>
 *   <template #fallback>
 *     <!-- Optional: Content to show when features are disabled -->
 *     <p>This feature is not available</p>
 *   </template>
 * </FeatureToggle>
 * ```
 *
 * @example
 * // Simple usage with single feature
 * <FeatureToggle :features="['sharing']">
 *   <ShareButton />
 * </FeatureToggle>
 *
 * @example
 * // With fallback content
 * <FeatureToggle :features="['premium']">
 *   <template #default>
 *     <PremiumFeatures />
 *   </template>
 *   <template #fallback>
 *     <UpgradePrompt />
 *   </template>
 * </FeatureToggle>
 */

import type { EnterpriseEditionFeatureValue } from '@/Interface';

/**
 * Component props definition
 */
interface Props {
	/**
	 * Array of feature identifiers to check for availability.
	 * In this version, this is kept for API compatibility but not actively used
	 * as all features are considered enabled.
	 *
	 * @example ['workflow-sharing', 'credential-sharing', 'ldap']
	 */
	features: EnterpriseEditionFeatureValue[];
}

// Define props with default values
const props = withDefaults(defineProps<Props>(), {
	features: () => [],
});

/**
 * Feature access determination.
 *
 * In this implementation, all features are considered accessible.
 * This const is set to true to ensure that the default slot is always rendered,
 * effectively making all features available without restrictions.
 *
 * This approach:
 * - Maintains backward compatibility with existing components
 * - Eliminates feature paywalls
 * - Simplifies the feature toggle logic
 * - Ensures consistent user experience across all deployments
 */
const canAccess = true;

/**
 * Feature list debugging (development mode only)
 * Log the requested features for development and debugging purposes.
 */
if (import.meta.env.DEV && props.features.length > 0) {
	console.debug('[FeatureToggle] Requested features:', props.features, '→ Access granted');
}
</script>

<template>
	<!--
		Feature Toggle Container
		
		This component renders one of two slots based on feature accessibility:
		- default slot: Rendered when features are accessible (current: always)
		- fallback slot: Rendered when features are not accessible (current: never)
		
		The component uses a simple div wrapper to maintain DOM structure
		and provide a mounting point for the conditional content.
	-->
	<div class="feature-toggle">
		<!--
			Primary content slot
			Shown when the requested features are available.
			In this version, this is always rendered.
		-->
		<slot v-if="canAccess" />

		<!--
			Fallback content slot (optional)
			Would be shown if features were not available.
			In this version, this slot is never activated as all features are enabled.
			Kept for API compatibility with parent components.
		-->
		<slot v-else name="fallback" />
	</div>
</template>

<style lang="scss" scoped>
/**
 * Feature Toggle Styles
 * 
 * Minimal styling to ensure the component doesn't interfere with layout.
 * The component acts as a transparent wrapper.
 */
.feature-toggle {
	/**
	 * Use flex display to maintain proper layout of child elements.
	 * This ensures that slotted content flows naturally.
	 */
	display: contents;
}
</style>
