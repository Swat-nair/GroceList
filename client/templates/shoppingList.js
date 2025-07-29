import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ShoppingLists } from '../../imports/api/shoppingLists';
import './shoppingList.html';

Template.shoppingList.onCreated(function () {
    this.searchQuery = new ReactiveVar('');
});

Template.shoppingList.helpers({
    shoppingItems() {
        const query = Template.instance().searchQuery.get().toLowerCase();
        return ShoppingLists.find({
            owner: Meteor.userId(), // Added owner filter
            name: { $regex: query, $options: 'i' }
        }, { sort: { createdAt: -1 } });
    },
    checkedIf(condition) {
        return condition ? 'checked' : '';
    }
});

Template.shoppingList.events({
    'input #search-shopping'(e, instance) {
        instance.searchQuery.set(e.target.value);
    },
    'submit .new-shopping-item'(e) {
        e.preventDefault();
        const name = e.target.name.value;
        Meteor.call('shopping.insert', name);
        e.target.reset();
    },
    'change .toggle-purchased'(e) {
        const itemId = e.target.dataset.id;
        const purchased = e.target.checked;
        Meteor.call('shopping.togglePurchased', itemId, purchased);
    },
    'click .delete-shopping'(e) {
        const itemId = e.target.dataset.id;
        Meteor.call('shopping.remove', itemId);
    }
});