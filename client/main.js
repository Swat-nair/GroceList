import 'meteor/accounts-ui';
import 'meteor/accounts-base';

import '../imports/api/pantryItems.js';
import '../imports/api/shoppingLists.js';
import '../imports/api/recipes.js';

import './templates/navbar.js';
import './templates/dashboard.js';
import './templates/pantry.js';
import './templates/addItem.js';
import './templates/shoppingList.js';
import './templates/calendar.html';
import './templates/calendar.js'; 

Meteor.subscribe('pantryItems');
Meteor.subscribe('shoppingLists');

