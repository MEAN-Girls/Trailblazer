'use strict';

// Configuring the Boundarys module
angular.module('boundarys').run(['Menus',
  function (Menus) {
    // Add the boundarys dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Boundarys',
      state: 'boundarys',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'boundarys', {
      title: 'List Boundarys',
      state: 'boundarys.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'boundarys', {
      title: 'Create Boundarys',
      state: 'boundarys.create',
      roles: ['user', 'admin']
    });
  }
]);
