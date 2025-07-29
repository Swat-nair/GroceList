import { Meteor } from 'meteor/meteor';
import { PantryItems } from '../imports/api/pantryItems.js';
import { ShoppingLists } from '../imports/api/shoppingLists.js';

Meteor.publish('pantryItems', function () {
    if (!this.userId) return this.ready();
    return PantryItems.find({ owner: this.userId }); // Changed from userId to owner
});

Meteor.publish('shoppingLists', function () {
    if (!this.userId) return this.ready();
    return ShoppingLists.find({ owner: this.userId }); // Changed from userId to owner
});