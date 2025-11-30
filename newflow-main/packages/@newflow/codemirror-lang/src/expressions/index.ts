/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { LRLanguage, LanguageSupport, foldNodeProp, foldInside } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';

import { parser } from './grammar';

export const expressionParser = parser;

export const parserWithMetaData = parser.configure({
	props: [
		foldNodeProp.add({
			Application: foldInside,
		}),
		styleTags({
			OpenMarker: t.brace,
			CloseMarker: t.brace,
			Plaintext: t.content,
			Resolvable: t.string,
		}),
	],
});

export const n8nLanguage = LRLanguage.define({
	parser: parserWithMetaData,
	languageData: {
		commentTokens: { line: ';' },
	},
});

export function n8nExpression() {
	return new LanguageSupport(n8nLanguage);
}
