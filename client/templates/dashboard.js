import { Template } from 'meteor/templating';
import { PantryItems } from '../../imports/api/pantryItems';
import { ShoppingLists } from '../../imports/api/shoppingLists';
import Chart from 'chart.js/auto';
import './dashboard.html';

Template.dashboard.onRendered(function () {
    const ctx = document.getElementById('pantryChart').getContext('2d');

    // Get current data for the chart
    const total = PantryItems.find({ owner: Meteor.userId() }).count();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const soon = PantryItems.find({
        owner: Meteor.userId(),
        expiresAt: { $lte: threeDaysFromNow }
    }).count();

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Expiring Soon', 'Safe'],
            datasets: [{
                label: 'Pantry Status',
                data: [soon, total - soon],
                backgroundColor: ['#f44336', '#4caf50'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});

Template.dashboard.helpers({
    pantryCount() {
        return PantryItems.find({ owner: Meteor.userId() }).count();
    },
    expiringSoonCount() {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return PantryItems.find({
            owner: Meteor.userId(),
            expiresAt: { $lte: threeDaysFromNow }
        }).count();
    },
    totalItems() {
        return PantryItems.find({ owner: Meteor.userId() }).count();
    },
    expiringSoon() {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return PantryItems.find({
            owner: Meteor.userId(),
            expiresAt: { $lte: threeDaysFromNow }
        }).count();
    },
    totalShoppingItems() {
        return ShoppingLists.find({ owner: Meteor.userId() }).count();
    }
});