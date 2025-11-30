/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import OTPAuth from 'otpauth';

@Service()
export class TOTPService {
	generateSecret(): string {
		return new OTPAuth.Secret()?.base32;
	}

	generateTOTPUri({
		issuer = 'n8n',
		secret,
		label,
	}: {
		secret: string;
		label: string;
		issuer?: string;
	}) {
		return new OTPAuth.TOTP({
			secret: OTPAuth.Secret.fromBase32(secret),
			issuer,
			label,
		}).toString();
	}

	verifySecret({
		secret,
		mfaCode,
		window = 2,
	}: { secret: string; mfaCode: string; window?: number }) {
		return new OTPAuth.TOTP({
			secret: OTPAuth.Secret.fromBase32(secret),
		}).validate({ token: mfaCode, window }) === null
			? false
			: true;
	}

	generateTOTP(secret: string) {
		return OTPAuth.TOTP.generate({
			secret: OTPAuth.Secret.fromBase32(secret),
		});
	}
}
