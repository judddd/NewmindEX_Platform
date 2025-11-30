/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/// <reference lib="es2022.error" />

declare module '@n8n_io/riot-tmpl' {
	interface Brackets {
		set(token: string): void;
	}

	type ReturnValue = string | null | (() => unknown);
	type TmplFn = (value: string, data: unknown) => ReturnValue;
	interface Tmpl extends TmplFn {
		errorHandler?(error: Error): void;
	}

	let brackets: Brackets;
	let tmpl: Tmpl;
}

interface BigInt {
	toJSON(): string;
}
