import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check'; // Added Match import
import { PantryItems } from '../imports/api/pantryItems.js';
import { ShoppingLists } from '../imports/api/shoppingLists.js';

Meteor.methods({
    // Pantry Methods
    'pantry.insert'(item) {
        check(item, {
            name: String,
            quantity: Match.Optional(String),
            category: Match.Optional(String),
            expiresAt: Date,
            barcode: Match.Optional(String)
        });

        if (!this.userId) throw new Meteor.Error('not-authorized');

        PantryItems.insert({
            name: item.name.trim(),
            quantity: item.quantity || '1',
            category: item.category || 'Other',
            expiresAt: item.expiresAt,
            barcode: item.barcode || '',
            owner: this.userId,
            createdAt: new Date()
        });
    },

    'pantry.update'(itemId, name, quantity, expiresAt, category) { // Fixed parameters
        check(itemId, String);
        check(name, String);
        check(quantity, String);
        check(expiresAt, Date);
        check(category, String);

        if (!this.userId) throw new Meteor.Error('not-authorized');

        PantryItems.update(itemId, {
            $set: {
                name: name.trim(),
                quantity: quantity,
                expiresAt: expiresAt,
                category: category
            }
        });
    },

    'pantry.remove'(itemId) {
        check(itemId, String);
        if (!this.userId) throw new Meteor.Error('not-authorized');
        PantryItems.remove(itemId);
    },

    // Shopping List Methods
    'shopping.insert'(name) {
        check(name, String);
        if (!this.userId) throw new Meteor.Error('not-authorized');

        ShoppingLists.insert({
            name: name.trim(),
            purchased: false,
            owner: this.userId,
            createdAt: new Date()
        });
    },

    'shopping.togglePurchased'(itemId, purchased) {
        check(itemId, String);
        check(purchased, Boolean);
        if (!this.userId) throw new Meteor.Error('not-authorized');

        ShoppingLists.update(itemId, {
            $set: {
                purchased,
                purchasedAt: purchased ? new Date() : null
            }
        });
    },

    'shopping.remove'(itemId) {
        check(itemId, String);
        if (!this.userId) throw new Meteor.Error('not-authorized');
        ShoppingLists.remove(itemId);
    },

    // Bulk Operations
    'pantry.importCSV'(items) {
        check(items, Array);
        if (!this.userId) throw new Meteor.Error('not-authorized');

        items.forEach(item => {
            check(item, {
                name: String,
                quantity: String,
                category: String,
                expiresAt: Date
            });

            Meteor.call('pantry.insert', {
                name: item.name,
                quantity: item.quantity,
                category: item.category,
                expiresAt: item.expiresAt
            });
        });
    }
});