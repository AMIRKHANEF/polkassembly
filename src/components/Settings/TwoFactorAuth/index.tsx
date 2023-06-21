// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';

import Header from '../Header';
import { useUserDetailsContext } from '~src/context';
import Enable2FA from './Enable2FA';
import Disable2FA from './Disable2FA';

const TwoFactorAuth: FC<{className?: string}> = ({ className }) => {
	const { is2FAEnabled } = useUserDetailsContext();

	return (
		<section className={className}>
			<Header heading='Two Factor Authentication' subHeading='Enhance account security with two factor authentication. Verify your identity with an extra step for added protection.' />

			{ !is2FAEnabled ? <Enable2FA /> : <Disable2FA /> }
		</section>
	);
};

export default TwoFactorAuth;