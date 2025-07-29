import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { PantryItems } from '../imports/api/pantryItems';
import './publications.js';
import './methods.js';
import '../imports/api/shoppingLists';
import '../imports/api/recipes';

Meteor.startup(() => {
    // Create default test user if none exist
    if (Meteor.users.find().count() === 0) {
        Accounts.createUser({
            username: 'testuser',
            email: 'test@example.com',
            password: 'test1234',
        });
    }

    // Add sample pantry items for test user
    const user = Meteor.users.findOne({ username: 'testuser' });

    if (user && PantryItems.find({ owner: user._id }).count() === 0) {
        const today = new Date();
        PantryItems.insert({
            name: 'Milk',
            quantity: '1L',
            expiresAt: new Date(today.getTime() + 2 * 86400000),
            owner: user._id
        });
        PantryItems.insert({
            name: 'Eggs',
            quantity: '6 pcs',
            expiresAt: new Date(today.getTime() + 5 * 86400000),
            owner: user._id
        });
        PantryItems.insert({
            name: 'Bread',
            quantity: '1 loaf',
            expiresAt: new Date(today.getTime() + 1 * 86400000),
            owner: user._id
        });
    }
});