// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import { StopOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useDispatch } from 'react-redux';
import { batchVotesActions } from '~src/redux/batchVoting';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import DefaultVotingOptionsModal from '../Listing/Tracks/DefaultVotingOptionsModal';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { useTheme } from 'next-themes';
import { useBatchVotesSelector } from '~src/redux/selectors';

interface IProposalInfoCard {
	voteInfo: any;
	index: number;
	key?: number;
}

const ProposalInfoCard: FC<IProposalInfoCard> = (props) => {
	const { index, voteInfo } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { edit_vote_details, batch_vote_details } = useBatchVotesSelector();
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);

	const handleRemove = (postId: number) => {
		dispatch(batchVotesActions.setRemoveVoteCardInfo(postId));
	};

	return (
		<section
			key={index}
			className='mb-4 h-[106px] w-full rounded-xl border border-solid border-grey_border bg-white'
		>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<p className='text-bodyblue m-0 p-0 text-xs'>#{voteInfo.post_id}</p>
				<p className='text-bodyblue m-0 p-0 text-xs'>{voteInfo.post_title?.substring(0, 50)}...</p>
				<ImageIcon
					src='/assets/icons/eye-icon-grey.svg'
					alt='eye-icon'
					imgWrapperClassName='ml-auto'
				/>
			</article>
			<Divider
				type='horizontal'
				className='border-l-1 my-0 border-grey_border dark:border-icon-dark-inactive'
			/>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<div className='mr-auto flex items-center gap-x-1'>
					{voteInfo?.voted_for === 'Aye' || voteInfo?.voted_for === 'Nye' ? (
						<ImageIcon
							src={`${voteInfo?.voted_for === 'Aye' ? '/assets/icons/like-icon-green.svg' : '/assets/icons/dislike-icon-red.svg'}`}
							imgClassName='text-black'
							alt='like-dislike-icon'
						/>
					) : (
						<StopOutlined className='text-[#909090] dark:text-white' />
					)}
					<p
						className={`${
							voteInfo?.voted_for === 'Aye' ? 'text-aye_green dark:text-aye_green_Dark' : voteInfo?.voted_for === 'Nye' ? 'text-nye_red dark:text-nay_red_Dark' : 'text-bodyBlue'
						} text-capitalize m-0 p-0 text-xs`}
					>
						{voteInfo?.voted_for}
					</p>
				</div>
				<div className='flex items-center justify-center gap-x-2'>
					<p className='m-0 p-0 text-xs text-bodyBlue'>{voteInfo?.vote_balance?.toNumber() / 10000000000 || 0} DOT</p>
					<p className='m-0 p-0 text-xs text-bodyBlue'>{voteInfo?.vote_conviction || '0x'}</p>
				</div>
				<div className='ml-auto flex items-center gap-x-4'>
					<Button
						className='m-0 flex items-center justify-center border-none bg-none p-0'
						onClick={() => {
							setOpenEditModal(true);
						}}
					>
						<ImageIcon
							src='/assets/icons/edit-option-icon.svg'
							alt='eye-icon'
						/>
					</Button>
					<Button
						className='m-0 flex items-center justify-center border-none bg-none p-0'
						onClick={() => handleRemove(voteInfo.post_id)}
					>
						<ImageIcon
							src='/assets/icons/bin-icon-grey.svg'
							alt='bin-icon'
						/>
					</Button>
				</div>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
					open={openEditModal}
					footer={
						<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								variant='default'
								text='Cancel'
								buttonsize='sm'
								onClick={() => {
									setOpenEditModal(false);
								}}
							/>
							<CustomButton
								variant='primary'
								text='Done'
								buttonsize='sm'
								onClick={() => {
									dispatch(
										batchVotesActions.setvoteCardInfo({
											post_id: voteInfo.post_id,
											post_title: voteInfo.title,
											vote_balance:
												edit_vote_details?.voteOption === 'aye'
													? edit_vote_details?.ayeVoteBalance
													: edit_vote_details?.voteOption === 'nay'
													? edit_vote_details?.nyeVoteBalance
													: edit_vote_details?.abstainVoteBalance,
											vote_conviction: edit_vote_details?.conviction || '0x',
											voted_for: edit_vote_details?.voteOption || batch_vote_details?.conviction || 'Aye'
										})
									);
									setOpenEditModal(false);
								}}
							/>
						</div>
					}
					maskClosable={false}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					onCancel={() => {
						setOpenEditModal(false);
					}}
					title={
						<div className='-mx-6 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
							Set Voting Details
						</div>
					}
				>
					<DefaultVotingOptionsModal
						theme={theme}
						forSpecificPost={true}
						postEdit={voteInfo.post_id}
					/>
				</Modal>
			</article>
		</section>
	);
};

export default ProposalInfoCard;
