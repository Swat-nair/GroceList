import { Template } from 'meteor/templating';
import { PantryItems } from '/imports/api/pantryItems';
import './calendar.html';

Template.calendar.helpers({
    weeks() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const weeks = [];
        let week = [];

        // Fill empty days before the 1st
        for (let i = 0; i < firstDay.getDay(); i++) {
            week.push({ day: '', items: [] });
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const items = PantryItems.find({
                owner: Meteor.userId(), // Added owner filter
                expiresAt: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }).fetch();

            week.push({ day: d, items });

            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        // Fill empty days after end of month
        if (week.length > 0) {
            while (week.length < 7) {
                week.push({ day: '', items: [] });
            }
            weeks.push(week);
        }

        return weeks;
    }
});