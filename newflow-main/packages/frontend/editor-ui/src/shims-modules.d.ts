/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Modules
 */

declare module 'vue-agile';

/**
 * File types
 */

declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module '*.json';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';

declare module '*?raw' {
	const content: string;
	export default content;
}

declare module 'v3-infinite-loading' {
	import { Plugin, DefineComponent } from 'vue';

	interface InfiniteLoadingProps {
		target: string;
	}

	export interface Events {
		infinite: (state: { loaded: () => void; complete: () => void }) => void;
	}

	const InfiniteLoading: DefineComponent<InfiniteLoadingProps, {}, {}, {}, {}, {}, {}, Events> &
		Plugin;

	export default InfiniteLoading;
}
