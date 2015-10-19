import Ember from 'ember';

const { Controller, computed: { alias, sort, notEmpty } } = Ember;

export default Controller.extend({
  currentRoute: alias('model.routeName'),

  routeActions: alias('model.routeActions'),

  hasRouteActions: notEmpty('routeActions'),

  controllerActions: alias('model.controllerActions'),

  hasControllerActions: notEmpty('controllerActions'),

  sortProps: ['name'],

  sortedRouteActions: sort('routeActions', 'sortProps'),

  sortedControllerActions: sort('controllerActions', 'sortProps')
});