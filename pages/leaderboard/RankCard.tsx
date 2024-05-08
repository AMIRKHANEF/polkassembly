// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import ImageComponent from '~src/components/ImageComponent';
import NameLabel from '~src/ui-components/NameLabel';
import DelegateModal from '~src/components/Listing/Tracks/DelegateModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Divider } from 'antd';
import { formatTimestamp } from './utils';

interface RankCardProps {
	place: number;
	data: any;
	theme: string | undefined;
	type: string;
	className?: string;
}

const RankCard: React.FC<RankCardProps> = ({ place, data, theme, type, className }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');

	const getUserProfile = async (username: string) => {
		const { data, error } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (!data || error) {
			console.log(error);
		}
		if (data) {
			setAddress(data?.addresses[0]);
		}
	};

	const placeImageMap: Record<number, string> =
		theme === 'dark'
			? {
					1: '/assets/FirstPlaceDark.svg',
					2: '/assets/SecondPlaceDark.svg',
					3: '/assets/ThirdPlaceDark.svg'
			  }
			: {
					1: '/assets/FirstPlace.svg',
					2: '/assets/SecondPlace.svg',
					3: '/assets/ThirdPlace.svg'
			  };

	const iconSources =
		theme === 'dark'
			? {
					bookmark: '/assets/icons/auctionIcons/BookmarkDark.svg',
					delegate: '/assets/icons/auctionIcons/delegateDarkIcon.svg',
					monetization: '/assets/icons/auctionIcons/monetizationDarkIcon.svg'
			  }
			: {
					bookmark: '/assets/icons/auctionIcons/BookmarkLight.svg',
					delegate: '/assets/icons/auctionIcons/delegateLightIcon.svg',
					monetization: '/assets/icons/auctionIcons/monetizationLightIcon.svg'
			  };

	return (
		<div
			style={{ backgroundImage: `url(${placeImageMap[place]})` }}
			className={`-ml-2 ${type === 'primary' ? 'h-[217px] w-[456px]' : 'h-[197px] w-[400px]'} relative bg-cover bg-center bg-no-repeat ${className}`}
		>
			<div className={`${type === 'primary' ? 'ml-9 h-[217px] w-[390px]' : 'ml-2 h-[197px] w-[400px] px-8'}`}>
				<p className='m-0 mt-1 flex justify-center p-0 text-base font-semibold text-bodyBlue'>Rank 0{place}</p>
				<div
					className='mx-auto flex h-7 w-[93px] items-center justify-center rounded-lg bg-[#FFD669]'
					style={{ border: '0.9px solid #9EA1A7' }}
				>
					<StarIcon />
					<p className='m-0 ml-1.5 p-0 text-sm text-[#534930]'>{data?.profile_score}</p>
					<InfoIcon style={{ transform: 'scale(0.8)' }} />
				</div>
				<div className={'mx-auto mt-6 flex items-center'}>
					<div className='-mt-1 flex items-center gap-x-2'>
						<ImageComponent
							src={data?.image || ''}
							alt='User Picture'
							className='flex h-[36px] w-[36px] items-center justify-center '
							iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
						/>

						<NameLabel
							usernameClassName='max-w-[9vw] 2xl:max-w-[12vw] text-base font-semibold text-bodyBlue dark:text-white'
							// defaultAddress={proposer}
							username={data?.username}
							usernameMaxLength={15}
							truncateUsername={false}
						/>
					</div>
					<div className='ml-auto flex'>
						<div
							onClick={() => {
								getUserProfile(data?.username);
								setOpen(true);
							}}
						>
							<ImageIcon
								src={iconSources.delegate}
								alt='delegation-icon'
								className='icon-container mr-4 cursor-pointer'
							/>
						</div>
						<ImageIcon
							src={iconSources.monetization}
							alt='monetization-icon'
							className='icon-container mr-4 cursor-not-allowed opacity-50'
						/>
						<ImageIcon
							src={iconSources.bookmark}
							alt='bookmark-icon'
							className='icon-container cursor-not-allowed opacity-50'
						/>
					</div>
				</div>

				<div className='mx-auto -mt-1'>
					<Divider
						style={{ background: '#D2D8E0' }}
						className='dark:bg-separatorDark'
					/>
				</div>
				<div className={`mx-auto ${type === 'primary' ? '-mt-1' : '-mt-3'} flex  items-center`}>
					<p className='m-0 whitespace-nowrap p-0 text-sm text-lightBlue dark:text-[#909090]'>User Since: </p>
					<span className='flex items-center gap-x-1 whitespace-nowrap text-xs text-bodyBlue dark:text-white'>
						<ImageIcon
							src='/assets/icons/Calendar.svg'
							alt='calenderIcon'
							className='icon-container -mt-0.5 scale-75'
						/>
						{formatTimestamp(data?.created_at._seconds)}
					</span>
				</div>
			</div>
			{address && (
				<DelegateModal
					// trackNum={trackDetails?.trackId}
					defaultTarget={address}
					open={open}
					setOpen={setOpen}
				/>
			)}
		</div>
	);
};

export default RankCard;
