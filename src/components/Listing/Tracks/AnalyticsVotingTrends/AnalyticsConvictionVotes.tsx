// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Nudge from '~src/components/Post/Tabs/PostStats/Tabs/Nudge';
import { IVoteDetailType } from '~src/types';

interface IProps {
	convictionVotes: IVoteDetailType[];
}
const AnalyticsConvictionVotes = ({ convictionVotes }: IProps) => {
	console.log('convictionVotes', convictionVotes);
	return (
		<>
			<Nudge text='Conviction vote is the number of tokens used for voting multiplied by conviction .' />
			<div>Hello From Conviction</div>
		</>
	);
};

export default AnalyticsConvictionVotes;
