/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { describe, it, expect, vi } from 'vitest'; // Change to jest if needed
import { pasteHandler } from './utils';
import type { EditorView } from '@codemirror/view';

describe('pasteHandler', () => {
	it('replaces empty onclick attributes and dispatches changes', () => {
		const clipboardData = {
			getData: (type: string) => (type === 'text/html' ? '<div onclick=""></div>' : ''),
		};

		const preventDefault = vi.fn();
		const dispatch = vi.fn();

		const event = { clipboardData, preventDefault } as unknown as ClipboardEvent;
		const view = {
			state: {
				selection: {
					main: { from: 0, to: 0 },
				},
			},
			dispatch,
		} as unknown as EditorView;

		const result = pasteHandler(event, view);

		expect(result).toBe(true);
		expect(preventDefault).toHaveBeenCalled();
		expect(dispatch).toHaveBeenCalledWith({
			changes: {
				from: 0,
				to: 0,
				insert: '<div onclick=" "></div>',
			},
			scrollIntoView: true,
		});
	});

	it('does nothing if there is no onclick="" in pasted content', () => {
		const clipboardData = {
			getData: (type: string) => (type === 'text/html' ? '<p>Hello world</p>' : ''),
		};
		const preventDefault = vi.fn();
		const dispatch = vi.fn();

		const event = { clipboardData, preventDefault } as unknown as ClipboardEvent;
		const view = {
			state: {
				selection: {
					main: { from: 0, to: 0 },
				},
			},
			dispatch,
		} as unknown as EditorView;

		const result = pasteHandler(event, view);

		expect(result).toBe(false);
		expect(preventDefault).not.toHaveBeenCalled();
		expect(dispatch).not.toHaveBeenCalled();
	});

	it('does nothing if clipboard data is empty', () => {
		const clipboardData = {
			getData: () => '',
		};
		const preventDefault = vi.fn();
		const dispatch = vi.fn();

		const event = { clipboardData, preventDefault } as unknown as ClipboardEvent;
		const view = {
			state: {
				selection: {
					main: { from: 0, to: 0 },
				},
			},
			dispatch,
		} as unknown as EditorView;

		const result = pasteHandler(event, view);

		expect(result).toBe(false);
		expect(preventDefault).not.toHaveBeenCalled();
		expect(dispatch).not.toHaveBeenCalled();
	});
});
