// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import MultiSelect from 'components/multiselect/multiselect';

import Constants from 'utils/constants';

import ListItem from '../list_item';
import {Option, optionValue, OptionValue} from '../types';
import { options } from 'marked';

const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM - 1;
export const USERS_PER_PAGE = 50;

type Props = {
    addValue: (value: OptionValue) => void;
    currentUserId: string;
    handleDelete: (values: OptionValue[]) => void;
    handlePageChange: (page: number, prevPage: number) => void;
    handleSubmit: (values?: OptionValue[]) => void;
    isExistingChannel: boolean;
    loading: boolean;
    options: Option[];
    saving: boolean;
    search: (term: string) => void;
    searchTerm: string;
    selectedItemRef: React.RefObject<HTMLDivElement>;
    totalCount: number;
    users: UserProfile[];

    /**
     * An array of values that have been selected by the user in the multiselect.
     */
    values: OptionValue[];
}

const List = React.forwardRef((props: Props, ref?: React.Ref<MultiSelect<OptionValue>>) => {
    // const computeOptions = (): Option[] => {
    //     const {
    //         currentUserId,
    //         searchTerm,
    //         myDirectChannels,
    //         dmUsers,
    //         values,
    //     } = props;

    //     const [activeUsers, inactiveUsers] = partition(this.props.users, ({delete_at: deleteAt}) => deleteAt === 0);

    //     const groupChannelsWithAvailableProfiles = this.props.groupChannels.filter(({profiles}) => differenceBy(profiles, values, 'id').length);
    //     const [recentGroupChannels, groupChannels] = partition(groupChannelsWithAvailableProfiles, 'last_post_at');

    //     let users = values.length ? activeUsers.filter(({id}) => id !== currentUserId) : activeUsers.concat(inactiveUsers);

    //     users = users.filter((user) => (
    //         (user.delete_at === 0 || myDirectChannels.some(({name}) => name.includes(user.id))) &&
    //         !dmUsers.some(({id}) => id === user.id)
    //     ));

    //     const recent = [
    //         ...values.length ? dmUsers.filter(({id}) => id !== currentUserId) : dmUsers,
    //         ...recentGroupChannels,
    //     ].sort((a, b) => b.last_post_at - a.last_post_at);

    //     if (recent.length && !searchTerm) {
    //         return recent.slice(0, 20);
    //     }

    //     return [
    //         ...recent,
    //         ...users,
    //         ...groupChannels,
    //     ];
    // };

    const renderOptionValue = useCallback((
        option: OptionValue,
        isSelected: boolean,
        add: (value: OptionValue) => void,
        select: (value: OptionValue) => void,
    ) => {
        return (
            <ListItem
                ref={isSelected ? props.selectedItemRef : undefined}
                option={option}
                isSelected={isSelected}
                add={add}
                select={select}
            />
        );
    }, [props.selectedItemRef]);

    const handleSubmitImmediatelyOn = useCallback((value: OptionValue) => {
        return value.id === props.currentUserId || Boolean(value.delete_at);
    }, [props.currentUserId]);

    const intl = useIntl();

    let note;
    if (props.isExistingChannel) {
        if (props.values.length >= MAX_SELECTABLE_VALUES) {
            note = (
                <FormattedMessage
                    id='more_direct_channels.new_convo_note.full'
                    defaultMessage={'You\'ve reached the maximum number of people for this conversation. Consider creating a private channel instead.'}
                />
            );
        } else {
            note = (
                <FormattedMessage
                    id='more_direct_channels.new_convo_note'
                    defaultMessage={'This will start a new conversation. If you\'re adding a lot of people, consider creating a private channel instead.'}
                />
            );
        }
    }

    const options = useMemo(() => {
        return props.options.map(optionValue);
    }, [props.options]);

    return (
        <MultiSelect<OptionValue>
            ref={ref}
            options={options}
            optionRenderer={renderOptionValue}
            selectedItemRef={props.selectedItemRef}
            values={props.values}
            valueRenderer={renderValue}
            ariaLabelRenderer={renderAriaLabel}
            perPage={USERS_PER_PAGE}
            handlePageChange={props.handlePageChange}
            handleInput={props.search}
            handleDelete={props.handleDelete}
            handleAdd={props.addValue}
            handleSubmit={props.handleSubmit}
            noteText={note}
            maxValues={MAX_SELECTABLE_VALUES}
            numRemainingText={
                <FormattedMessage
                    id='multiselect.numPeopleRemaining'
                    defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                    values={{
                        num: MAX_SELECTABLE_VALUES - props.values.length,
                    }}
                />
            }
            buttonSubmitText={
                <FormattedMessage
                    id='multiselect.go'
                    defaultMessage='Go'
                />
            }
            buttonSubmitLoadingText={
                <FormattedMessage
                    id='multiselect.loading'
                    defaultMessage='Loading...'
                />
            }
            submitImmediatelyOn={handleSubmitImmediatelyOn}
            saving={props.saving}
            loading={props.loading}
            users={props.users}
            totalCount={props.totalCount}
            placeholderText={intl.formatMessage({id: 'multiselect.placeholder', defaultMessage: 'Search and add members'})}
        />
    );
});
export default List;

function renderValue(props: {data: OptionValue}) {
    return (props.data as UserProfile).username;
}

function renderAriaLabel(option: OptionValue) {
    return (option as UserProfile)?.username ?? '';
}
