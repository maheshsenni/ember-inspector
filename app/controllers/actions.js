import Ember from 'ember';

const { Controller, computed: { alias, sort, notEmpty } } = Ember;

export default Controller.extend({
  // list-view.js requires application controller
  needs: ['application'],

  currentRoute: alias('model.definedActions.routeName'),

  routeActions: alias('model.definedActions.routeActions'),

  hasRouteActions: notEmpty('routeActions'),

  controllerActions: alias('model.definedActions.controllerActions'),

  hasControllerActions: notEmpty('controllerActions'),

  sortProps: ['name'],

  sortedRouteActions: sort('routeActions', 'sortProps'),

  sortedControllerActions: sort('controllerActions', 'sortProps'),

  detectedActions: alias('model.detectedActions')
});