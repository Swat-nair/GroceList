import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { PantryItems } from '../../imports/api/pantryItems.js';
import Papa from 'papaparse';
import './pantry.html';

Template.pantry.onCreated(function () {
    this.searchQuery = new ReactiveVar('');
});

Template.pantry.helpers({
    pantryItems() {
        const instance = Template.instance();
        const query = instance.searchQuery.get().toLowerCase();
        return PantryItems.find({
            owner: Meteor.userId(),
            name: { $regex: query, $options: 'i' }
        }, { sort: { expiresAt: 1 } });
    },
    isExpiringSoon(item) {
        const now = new Date();
        const diff = (item.expiresAt - now) / (1000 * 60 * 60 * 24);
        return diff < 3;
    },
    categoryIcon(category) {
        switch (category) {
            case 'dairy': return '🧀';
            case 'bakery': return '🍞';
            case 'produce': return '🥬';
            case 'meat': return '🍗';
            default: return '📦';
        }
    },
    expirationBadge(date) {
        const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 1) return 'badge-red';
        if (daysLeft <= 3) return 'badge-orange';
        return 'badge-green';
    },
    formatDate(date) {
        return date ? date.toISOString().split('T')[0] : '';
    },
    selected(value, option) {
        return value === option ? 'selected' : '';
    }
});

Template.pantry.events({
    'input #search-pantry'(e, instance) {
        instance.searchQuery.set(e.target.value);
    },
    'click .delete-item'(e) {
        Meteor.call('pantry.remove', this._id);
    },
    'submit .edit-item-form'(e) {
        e.preventDefault();
        const newName = e.target.name.value;
        const newQuantity = e.target.quantity.value;
        const newDate = new Date(e.target.expiresAt.value);
        const newCategory = e.target.category.value;
        Meteor.call('pantry.update', this._id, newName, newQuantity, newDate, newCategory);

        // Hide edit form and show display
        $(e.target).hide();
        $(e.target).closest('li').find('.item-display').show();
    },
    'click .edit-item'(e) {
        $(e.target).closest('.item-display').hide();
        $(e.target).closest('li').find('.edit-item-form').show();
    },
    'click .cancel-edit'(e) {
        $(e.target).closest('.edit-item-form').hide();
        $(e.target).closest('li').find('.item-display').show();
    },
    'click #exportCSV'(e) {
        e.preventDefault();
        const items = PantryItems.find({
            owner: Meteor.userId()
        }, {
                fields: {
                    name: 1,
                    quantity: 1,
                    category: 1,
                    expiresAt: 1,
                    createdAt: 1,
                    owner: 1
                }
            }).fetch();

        const formattedItems = items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            expiresAt: item.expiresAt.toISOString().split('T')[0],
            createdAt: item.createdAt.toISOString().split('T')[0]
        }));

        const csv = Papa.unparse(formattedItems);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const filename = `pantry_export_${new Date().toISOString().split('T')[0]}.csv`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    },
    'change #csv-upload'(e) {
        const file = e.target.files[0];
        const fileNameDisplay = document.getElementById('file-name-display');
        const importBtn = document.getElementById('import-csv-btn');

        if (file) {
            fileNameDisplay.textContent = file.name;
            importBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = 'No file selected';
            importBtn.disabled = true;
        }
    },
    'click #import-csv-btn'(e) {
        const fileInput = document.getElementById('csv-upload');
        if (fileInput.files.length === 0) {
            alert("Please select a file first.");
            return;
        }

        const file = fileInput.files[0];
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const validItems = results.data.filter(item =>
                    item.name && item.quantity && item.expiresAt
                );

                if (validItems.length === 0) {
                    alert('No valid items found in CSV');
                    return;
                }

                let successCount = 0;
                const promises = validItems.map((item) => {
                    return new Promise((resolve) => {
                        Meteor.call('pantry.insert', {
                            name: item.name.trim(),
                            quantity: item.quantity,
                            category: item.category || 'other',
                            expiresAt: new Date(item.expiresAt)
                        }, (error) => {
                            if (!error) successCount++;
                            resolve();
                        });
                    });
                });

                Promise.all(promises).then(() => {
                    alert(`Successfully imported ${successCount} of ${validItems.length} items`);
                    fileInput.value = '';
                    document.getElementById('file-name-display').textContent = 'No file selected';
                    document.getElementById('import-csv-btn').disabled = true;
                });
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                alert('Error parsing CSV file. Please check the format.');
            }
        });
    }
});