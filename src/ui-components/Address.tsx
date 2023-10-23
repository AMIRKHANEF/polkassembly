// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { DeriveAccountFlags, DeriveAccountRegistration, DeriveAccountInfo } from '@polkadot/api-derive/types';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import { network as AllNetworks } from '~src/global/networkConstants';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getKiltDidName } from '~src/util/kiltDid';
import shortenAddress from '~src/util/shortenAddress';
import EthIdenticon from './EthIdenticon';
import Link from 'next/link';
import { EAddressOtherTextType } from '~src/types';
import classNames from 'classnames';
import styled from 'styled-components';
import IdentityBadge from './IdentityBadge';
import { Skeleton, Space } from 'antd';
import dynamic from 'next/dynamic';
import { useNetworkSelector } from '~src/redux/selectors';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
	loading: () => (
		<Skeleton.Avatar
			active
			size='large'
			shape='circle'
		/>
	),
	ssr: false
});

interface Props {
	address: string;
	className?: string;
	iconSize?: number;
	isSubVisible?: boolean;
	disableHeader?: boolean;
	displayInline?: boolean;
	addressClassName?: string;
	usernameMaxLength?: number;
	addressMaxLength?: number;
	isTruncateUsername?: boolean;
	usernameClassName?: string;
	disableIdenticon?: boolean;
	disableAddressClick?: boolean;
	showFullAddress?: boolean;
	extensionName?: string;
	addressOtherTextType?: EAddressOtherTextType;
	passedUsername?: string;
	ethIdenticonSize?: number;
	isVoterAddress?: boolean;
}

const shortenUsername = (username: string, usernameMaxLength?: number) => {
	if (username.length > 19) {
		return shortenAddress(username, usernameMaxLength || 8);
	}
	return username;
};

const Address = (props: Props) => {
	const {
		className,
		address,
		disableIdenticon = false,
		displayInline,
		iconSize,
		isSubVisible = true,
		showFullAddress,
		addressClassName,
		disableAddressClick = false,
		disableHeader,
		isTruncateUsername = true,
		usernameClassName,
		extensionName,
		usernameMaxLength,
		addressMaxLength,
		addressOtherTextType,
		passedUsername,
		ethIdenticonSize,
		isVoterAddress
	} = props;
	const { network } = useNetworkSelector();
	const apiContext = useContext(ApiContext);
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const [sub, setSub] = useState<string>('');
	const [identity, setIdentity] = useState<DeriveAccountRegistration>();
	const [flags, setFlags] = useState<DeriveAccountFlags>();
	const [username, setUsername] = useState<string>(passedUsername || '');
	const [kiltName, setKiltName] = useState<string>('');
	const [imgUrl, setImgUrl] = useState<string>();

	const encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	const [isAutoGeneratedUsername, setIsAutoGeneratedUsername] = useState(true); // Date from which we are sending custom username flag on web3 sign up.

	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady]);

	const FEATURE_RELEASE_DATE = dayjs('2023-06-12').toDate(); // Date from which we are sending custom username flag on web3 sign up.

	const fetchUsername = async () => {
		if (isVoterAddress) {
			return;
		}
		const substrateAddress = getSubstrateAddress(address);

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					return;
				}
				setUsername(data.username);
				setImgUrl(data.profile?.image);

				if (MANUAL_USERNAME_25_CHAR.includes(data.username) || data.custom_username || data.username.length !== 25) {
					setIsAutoGeneratedUsername(false);
					return;
				} else if (
					(data.web3Signup && !data.created_at && data.username.length === 25) ||
					(data.web3Signup && data.username.length === 25 && dayjs(data.created_at).isBefore(dayjs(FEATURE_RELEASE_DATE)))
				) {
					setIsAutoGeneratedUsername(true);
				}
			} catch (error) {
				// console.log(error);
			}
		}
	};
	const handleRedirectLink = () => {
		const substrateAddress = getSubstrateAddress(address);
		if (!username) {
			return `https://${network}.polkassembly.io/address/${substrateAddress}`;
		}
		return `https://${network}.polkassembly.io/user/${username}`;
	};

	const handleIdentityInfo = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.info(encodedAddr, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
				if (info.identity.displayParent && info.identity.display) {
					// when an identity is a sub identity `displayParent` is set
					// and `display` get the sub identity
					setMainDisplay(info.identity.displayParent);
					setSub(info.identity.display);
				} else {
					// There should not be a `displayParent` without a `display`
					// but we can't be too sure.
					setMainDisplay(
						info.identity.displayParent || info.identity.display || (!isAutoGeneratedUsername ? shortenUsername(username, usernameMaxLength) : null) || info.nickname || ''
					);
				}
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	};

	const getKiltName = async () => {
		if (!api || !apiReady) return;

		const web3Name = await getKiltDidName(api, address);
		setKiltName(web3Name ? `w3n:${web3Name}` : '');
	};
	const handleFlags = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.flags(encodedAddr, (result: DeriveAccountFlags) => {
				setFlags(result);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	};

	useEffect(() => {
		if (!api || !apiReady || !address || !encodedAddr) return;

		try {
			fetchUsername();
		} catch (error) {
			console.log(error);
		}
		handleIdentityInfo();
		handleFlags();
		if (network === AllNetworks.KILT) {
			setKiltName('');
			getKiltName();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, encodedAddr, network]);

	const addressPrefix =
		kiltName ||
		mainDisplay ||
		(!isAutoGeneratedUsername ? username : null) ||
		(!showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr) ||
		shortenUsername(username, usernameMaxLength);
	const addressSuffix = extensionName || mainDisplay;

	const handleClick = (event: any) => {
		event.stopPropagation();
		event.preventDefault();

		if (disableAddressClick) return;

		window.open(handleRedirectLink(), '_blank');
	};
	return (
		<div className={`${className} flex gap-1`}>
			{!disableIdenticon &&
				(encodedAddr.startsWith('0x') ? (
					<EthIdenticon
						className='image identicon flex items-center'
						size={ethIdenticonSize || iconSize || 26}
						address={encodedAddr}
					/>
				) : (
					<Identicon
						className='image identicon'
						value={encodedAddr}
						size={iconSize || displayInline ? 20 : 32}
						theme={'polkadot'}
					/>
				))}
			<div className='flex items-center text-bodyBlue'>
				{displayInline ? (
					<div className='inline-address flex items-center'>
						{!!kiltName ||
							(!!identity && !!mainDisplay && (
								<IdentityBadge
									address={address}
									identity={identity}
									flags={flags}
									className='text-navBlue'
									addressPrefix={addressPrefix}
									imgUrl={imgUrl}
								/>
							))}

						<div className={`flex items-center font-semibold text-bodyBlue ${!disableAddressClick ? 'hover:underline' : 'cursor-pointer'}`}>
							<Link
								href={handleRedirectLink()}
								target='_blank'
								onClick={(e) => handleClick(e)}
								title={mainDisplay || encodedAddr}
								className={`flex gap-x-1 ${usernameClassName ? usernameClassName : 'text-sm font-medium text-bodyBlue'} hover:text-bodyBlue`}
							>
								{!!addressPrefix && (
									<span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>
										{usernameMaxLength ? (addressPrefix.length > usernameMaxLength ? `${addressPrefix.slice(0, usernameMaxLength)}...` : addressPrefix) : addressPrefix}
									</span>
								)}
								{!!sub && !!isSubVisible && <span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>{sub}</span>}
							</Link>
						</div>
					</div>
				) : !!extensionName || !!mainDisplay ? (
					<div className='ml-0.5 font-semibold text-bodyBlue'>
						{!disableHeader && (
							<div>
								<div className='flex items-center'>
									{kiltName ||
										(!!identity && !!mainDisplay && (
											<IdentityBadge
												address={address}
												identity={identity}
												flags={flags}
												className='text-navBlue'
											/>
										))}
									<Space className={'header'}>
										<Link
											href={handleRedirectLink()}
											target='_blank'
											onClick={(e) => handleClick(e)}
											className={`flex flex-col font-semibold text-bodyBlue  ${!disableAddressClick ? 'hover:underline' : 'cursor-pointer'} hover:text-bodyBlue`}
										>
											{!!addressSuffix && <span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{addressSuffix}</span>}
											{!extensionName && sub && isSubVisible && (
												<span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{sub}</span>
											)}
										</Link>
									</Space>
								</div>
							</div>
						)}
						<div className={`${addressClassName} ${!disableAddressClick ? 'hover:underline' : 'cursor-pointer'} text-xs font-normal`}>
							{!showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
						</div>
					</div>
				) : (
					<div className={`${addressClassName} text-xs font-semibold`}>
						{kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
					</div>
				)}
			</div>
			{addressOtherTextType ? (
				<p className={'m-0 ml-auto flex items-center gap-x-1 text-[10px] leading-[15px] text-lightBlue'}>
					<span
						className={classNames('h-[6px] w-[6px] rounded-full', {
							'bg-aye_green ': [EAddressOtherTextType.LINKED_ADDRESS, EAddressOtherTextType.COUNCIL_CONNECTED].includes(addressOtherTextType),
							'bg-blue ': addressOtherTextType === EAddressOtherTextType.COUNCIL,
							'bg-nay_red': [EAddressOtherTextType.UNLINKED_ADDRESS].includes(addressOtherTextType)
						})}
					></span>
					<span className='text-xs text-lightBlue'>{addressOtherTextType}</span>
				</p>
			) : null}
		</div>
	);
};

export default styled(Address)`
	position: relative;
	display: flex;
	align-items: center;
`;
