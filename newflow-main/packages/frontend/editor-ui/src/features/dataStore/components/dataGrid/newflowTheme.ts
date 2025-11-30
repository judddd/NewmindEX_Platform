/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { iconSetAlpine, themeQuartz } from 'ag-grid-community';

export const newflowTheme = themeQuartz.withPart(iconSetAlpine).withParams({
	columnBorder: true,
	rowBorder: true,
	rowVerticalPaddingScale: 0.8,
	sidePanelBorder: true,
	wrapperBorder: true,
	headerColumnBorder: { color: 'var(--color-foreground-base)' },
	headerColumnBorderHeight: '100%',
	checkboxUncheckedBackgroundColor: 'var(--color-background-light-base)',
	checkboxCheckedBackgroundColor: 'var(--color-primary)',
});
