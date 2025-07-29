import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import './navbar.html';

Template.navbar.events({
    'click #logout'(e) {
        e.preventDefault();
        Meteor.logout();
    }
});
