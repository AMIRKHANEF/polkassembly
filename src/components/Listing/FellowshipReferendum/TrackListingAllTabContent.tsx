// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { FC } from 'react';
import { PostEmptyState } from 'src/ui-components/UIStates';

interface ITrackListingAllTabContentProps {
	className?: string;
	posts: any[];
}

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const TrackListingAllTabContent: FC<ITrackListingAllTabContentProps> = (props) => {
	const { className, posts } = props;

	const noPost = !posts || !posts.length;

	if (noPost) return <div className={className}><PostEmptyState /></div>;

	return (
		<div className={className}>
			{posts.map((post: any) => {
				return (
					<div key={post.post_id} className='my-5'>
						{<Link href={`/member-referenda/${post.post_id}`}>
							<GovernanceCard
								postReactionCount={post?.post_reactions}
								address={post.proposer}
								commentsCount={post.comments_count || 0}
								method={post.method}
								onchainId={post.post_id}
								status={post.status}
								title={post.title}
								topic={post.topic.name}
								created_at={post.created_at}
							/>
						</Link>}
					</div>
				);
			}
			)}
		</div>
	);
};

export default TrackListingAllTabContent;