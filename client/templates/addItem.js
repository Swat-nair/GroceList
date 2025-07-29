import { Template } from 'meteor/templating';
import { PantryItems } from '../../imports/api/pantryItems.js';
import './addItem.html';

Template.addItem.events({
    'submit .new-item-form'(e) {
        e.preventDefault();
        const target = e.target;
        const name = target.name.value;
        const expiresAt = new Date(target.expiresAt.value);
        const barcode = target.barcode.value;

        // Simulated barcode scan mapping
        const mockItems = {
            '123456': 'Milk',
            '234567': 'Eggs',
            '345678': 'Bread'
        };

        const resolvedName = mockItems[barcode] || name;

        Meteor.call('pantry.insert', { name: resolvedName, expiresAt, barcode });
        target.reset();
    }
});
