// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

describe('Integrations', () => {
    const testCases = [
        {command: '/away', className: 'icon-clock', message: 'You are now away'},
        {command: '/dnd', className: 'icon-minus-circle', message: 'Do Not Disturb is enabled. You will not receive desktop or mobile push notifications until Do Not Disturb is turned off.'},
        {command: '/offline', className: 'icon-circle-outline', message: 'You are now offline'},
        {command: '/online', className: 'icon-check-circle', message: 'You are now online'},
    ];

    let testChannelUrl;

    before(() => {
        // # Login as test user, go to town-square and set user status to online
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testChannelUrl = `/${team.name}/channels/town-square`;
        });
    });

    it('I18456 Built-in slash commands: change user status via post', () => {
        cy.apiSaveMessageDisplayPreference('compact');
        cy.visit(testChannelUrl);

        testCases.forEach((testCase) => {
            cy.postMessage(testCase.command + ' ');

            verifyUserStatus(testCase, true);
        });
    });

    it('I18456 Built-in slash commands: change user status via suggestion list', () => {
        cy.apiSaveMessageDisplayPreference('clean');
        cy.visit(testChannelUrl);

        testCases.forEach((testCase) => {
            // # Type "/" on textbox
            cy.get('#post_textbox').clear().type('/');

            // # Verify that the suggestion list is visible
            cy.get('#suggestionList').should('be.visible').then((container) => {
                // # Find command and click
                cy.contains(new RegExp(testCase.command), {container}).click({force: true});
            });

            // # Hit enter and verify user status
            cy.get('#post_textbox').type(' {enter}');
            verifyUserStatus(testCase, false);
        });
    });
});

function verifyUserStatus(testCase, isCompactMode) {
    // * Verify that the user status is as indicated
    cy.uiGetProfileHeader().
        find('i').
        should('be.visible').
        and('have.class', testCase.className);

    cy.uiWaitUntilMessagePostedIncludes(testCase.message);

    // * Verify that ephemeral message is posted as expected
    cy.getLastPostId().then((postId) => {
        cy.get(`#post_${postId}`).find('.user-popover').should('have.text', 'System');

        if (isCompactMode) {
            cy.get(`#postMessageText_${postId}`).should('have.text', testCase.message + ' (Only visible to you)');
        } else {
            cy.get(`#postMessageText_${postId}`).should('have.text', testCase.message);
            cy.get('.post__visibility').last().should('be.visible').and('have.text', '(Only visible to you)');
        }
    });
}
