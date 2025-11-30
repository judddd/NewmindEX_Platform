/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export const smartDecimal = (value: number, decimals = 2): number => {
	// Check if integer
	if (Number.isInteger(value)) {
		return value;
	}

	// Check if it has only one decimal place
	if (value.toString().split('.')[1].length <= decimals) {
		return value;
	}

	return Number(value.toFixed(decimals));
};
