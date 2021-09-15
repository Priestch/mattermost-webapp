// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';

import {PER_PAGE_DEFAULT} from 'mattermost-redux/client/client4';

import './search_results_footer.scss';
import type {Props} from './types';

export default function SearchResultsFooter(props: Props): JSX.Element {
    const [currentPage, setCurrentPage] = useState(0);
    const [lastPage, setLastPage] = useState(-1);

    const showNextPage = useCallback(() => {
        const page = currentPage + 1;
        props.actions.showFlaggedPostsWithPaginationSupport(page * 60, true);
        setCurrentPage(page);
    }, [currentPage]);

    const showPreviousPage = useCallback(() => {
        const page = currentPage > 1 ? currentPage - 1 : 0;
        props.actions.showFlaggedPostsWithPaginationSupport(page * 60, true);
        setCurrentPage(page);
    }, [currentPage]);

    useEffect(() => {
        const page = currentPage + 1;
        // eslint-disable-next-line @typescript-eslint/ban-types
        props.actions.showFlaggedPostsWithPaginationSupport(page * 60).then((resp: Object) => {
            if (resp.data && resp.data.order.length > 0) {
                if (resp.data.order.length < PER_PAGE_DEFAULT) {
                    setLastPage(currentPage + 1);
                }
            } else {
                setLastPage(currentPage);
            }
        });
    }, [currentPage]);

    return (
        <div
            className='SearchResultsFooter'
        >
            {/* eslint-disable-next-line */}
            <button disabled={currentPage === 0} onClick={showPreviousPage} className="btn-icon"><i className='icon icon-chevron-left'/></button>
            {/* eslint-disable-next-line */}
            <button disabled={lastPage !== -1 && lastPage === currentPage} onClick={showNextPage} className="btn-icon pull-right"><i className='icon icon-chevron-right'/></button>
        </div>);
}

const defaultProps: Partial<Props> = {
    actions: {},
};

SearchResultsFooter.defaultProps = defaultProps;
