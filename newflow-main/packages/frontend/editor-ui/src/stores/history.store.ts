/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Command, Undoable } from '@/models/history';
import { BulkCommand } from '@/models/history';
import { STORES } from '@newflow/stores';
import type { HistoryState } from '@/Interface';
import { defineStore } from 'pinia';

const STACK_LIMIT = 100;

export const useHistoryStore = defineStore(STORES.HISTORY, {
	state: (): HistoryState => ({
		undoStack: [],
		redoStack: [],
		currentBulkAction: null,
		bulkInProgress: false,
	}),
	actions: {
		popUndoableToUndo(): Undoable | undefined {
			if (this.undoStack.length > 0) {
				return this.undoStack.pop();
			}

			return undefined;
		},
		pushCommandToUndo(undoable: Command, clearRedo = true): void {
			if (!this.bulkInProgress) {
				if (this.currentBulkAction) {
					const alreadyIn =
						this.currentBulkAction.commands.find((c) => c.isEqualTo(undoable)) !== undefined;
					if (!alreadyIn) {
						this.currentBulkAction.commands.push(undoable);
					}
				} else {
					this.undoStack.push(undoable);
				}
				this.checkUndoStackLimit();
				if (clearRedo) {
					this.clearRedoStack();
				}
			}
		},
		pushBulkCommandToUndo(undoable: BulkCommand, clearRedo = true): void {
			this.undoStack.push(undoable);
			this.checkUndoStackLimit();
			if (clearRedo) {
				this.clearRedoStack();
			}
		},
		checkUndoStackLimit() {
			if (this.undoStack.length > STACK_LIMIT) {
				this.undoStack.shift();
			}
		},
		checkRedoStackLimit() {
			if (this.redoStack.length > STACK_LIMIT) {
				this.redoStack.shift();
			}
		},
		clearUndoStack() {
			this.undoStack = [];
		},
		clearRedoStack() {
			this.redoStack = [];
		},
		reset() {
			this.clearRedoStack();
			this.clearUndoStack();
		},
		popUndoableToRedo(): Undoable | undefined {
			if (this.redoStack.length > 0) {
				return this.redoStack.pop();
			}
			return undefined;
		},
		pushUndoableToRedo(undoable: Undoable): void {
			this.redoStack.push(undoable);
			this.checkRedoStackLimit();
		},
		startRecordingUndo() {
			this.currentBulkAction = new BulkCommand([]);
		},
		stopRecordingUndo() {
			if (this.currentBulkAction && this.currentBulkAction.commands.length > 0) {
				this.undoStack.push(this.currentBulkAction);
				this.checkUndoStackLimit();
			}
			this.currentBulkAction = null;
		},
	},
});
