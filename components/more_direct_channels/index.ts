// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, ActionCreatorsMapObject, Dispatch} from 'redux';

import {
    getProfiles,
    getProfilesInTeam,
    getTotalUsersStats,
    searchProfiles,
} from 'mattermost-redux/actions/users';
import {searchGroupChannels} from 'mattermost-redux/actions/channels';
import {
    getCurrentUserId,
    getProfiles as selectProfiles,
    getProfilesInCurrentChannel,
    getProfilesInCurrentTeam,
    makeSearchProfilesStartingWithTerm,
    searchProfilesInCurrentTeam,
    getTotalUsersStats as getTotalUsersStatsSelector,
} from 'mattermost-redux/selectors/entities/users';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import {openDirectChannelToUserId, openGroupChannelToUserIds} from 'actions/channel_actions';
import {loadStatusesForProfilesList, loadStatusesByIds} from 'actions/status_actions.jsx';
import {loadProfilesForGroupChannels} from 'actions/user_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import {GlobalState} from 'types/store';

import MoreDirectChannels from './more_direct_channels';

type OwnProps = {
    isExistingChannel: boolean;
}

const makeMapStateToProps = () => {
    const searchProfilesStartingWithTerm = makeSearchProfilesStartingWithTerm();

    return (state: GlobalState, ownProps: OwnProps) => {
        const currentUserId = getCurrentUserId(state);
        let currentChannelMembers;
        if (ownProps.isExistingChannel) {
            currentChannelMembers = getProfilesInCurrentChannel(state);
        }

        const config = getConfig(state);
        const restrictDirectMessage = config.RestrictDirectMessage;

        const searchTerm = state.views.search.modalSearch;

        let users: UserProfile[];
        if (searchTerm) {
            if (restrictDirectMessage === 'any') {
                users = searchProfilesStartingWithTerm(state, searchTerm, false);
            } else {
                users = searchProfilesInCurrentTeam(state, searchTerm, false);
            }
        } else if (restrictDirectMessage === 'any') {
            users = selectProfiles(state); // TODO this ain't memoized right
        } else {
            users = getProfilesInCurrentTeam(state);
        }

        const team = getCurrentTeam(state);
        const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

        return {
            currentTeamId: team.id,
            currentTeamName: team.name,
            searchTerm,
            users,
            statuses: state.entities.users.statuses,
            currentChannelMembers,
            currentUserId,
            restrictDirectMessage,
            totalCount: stats.total_users_count,
        };
    };
};

// const filterGroupChannels = memoizeResult((channels: GroupChannel[], term: string) => {
//     return channels.filter((channel) => {
//         const matches = filterProfilesStartingWithTerm(channel.profiles, term);
//         return matches.length > 0;
//     });
// });

// const filterDirectChannels = memoizeResult((channels: Record<string, Channel>, userId: string) => {
//     return Object.values(channels).filter((channel) => (
//         channel.type === Constants.DM_CHANNEL &&
//         channel.name.includes(userId)
//     ));
// });

type Actions = {
    getProfiles: (page?: number | undefined, perPage?: number | undefined, options?: any) => Promise<any>;
    getProfilesInTeam: (teamId: string, page: number, perPage?: number | undefined, sort?: string | undefined, options?: any) => Promise<any>;
    loadStatusesByIds: (userIds: string[]) => ActionFunc;
    getTotalUsersStats: () => ActionFunc;
    loadStatusesForProfilesList: (users: any) => {
        data: boolean;
    };
    loadProfilesForGroupChannels: (groupChannels: any) => Promise<any>;
    openDirectChannelToUserId: (userId: any) => Promise<any>;
    openGroupChannelToUserIds: (userIds: any) => Promise<any>;
    searchProfiles: (term: string, options?: any) => Promise<any>;
    searchGroupChannels: (term: string) => Promise<any>;
    setModalSearchTerm: (term: any) => GenericAction;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getProfiles,
            getProfilesInTeam,
            loadStatusesByIds,
            getTotalUsersStats,
            loadStatusesForProfilesList,
            loadProfilesForGroupChannels,
            openDirectChannelToUserId,
            openGroupChannelToUserIds,
            searchProfiles,
            searchGroupChannels,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(MoreDirectChannels);
