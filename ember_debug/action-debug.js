import PortMixin from 'ember-debug/mixins/port-mixin';

const Ember = window.Ember;
const { Object: EmberObject, computed, observer, run: { later } } = Ember;
const { oneWay } = computed;

const keys = Object.keys || Ember.keys;

const systemDefinedActions = ['_super', 'finalizeQueryParamChange', 'queryParamsDidChange'];

export default EmberObject.extend(PortMixin, {

  portNamespace: 'action',

  application: oneWay('namespace.application').readOnly(),

  port: oneWay('namespace.port').readOnly(),

  objectInspector: oneWay('namespace.objectInspector').readOnly(),

  adapter: oneWay('port.adapter').readOnly(),

  container: computed('application', function() {
    return this.get('application.__container__');
  }),

  router: computed('container', function() {
    return this.get('container').lookup('router:main');
  }),

  applicationController: computed('container', function() {
    return this.get('container').lookup('controller:application');
  }),

  currentPath: oneWay('applicationController.currentPath').readOnly(),

  getRouteActions() {
    let routeName = this.get('currentPath');
    let route = this.get('container').lookup('route:' + routeName);
    let routeActionsHash = route.get('_actions') || [];
    // remove system defined actions from actions names
    let routeActions = keys(routeActionsHash).removeObjects(systemDefinedActions).map(function(n) {
      return {
        name: n,
        target: 'route'
      };
    });
    this.set('routeActionsHash', routeActionsHash);
    return routeActions;
  },

  getControllerActions() {
    let routeName = this.get('currentPath');
    let controller = this.get('container').lookup('controller:' + routeName);
    let controllerActionsHash = controller.get('_actions') || [];

    let controllerActions = keys(controllerActionsHash).map(function(n) {
      return {
        name: n,
        target: 'controller'
      };
    });

    this.set('controllerActionsHash', controllerActionsHash);
    return controllerActions;
  },

  prepareForRoute: observer('currentPath', function() {
    this.releaseActions();
    let routeActions = this.getRouteActions();
    let controllerActions = this.getControllerActions();
    this.sendActions(routeActions, controllerActions);
    this.watchActions(routeActions, controllerActions);
  }),

  sendActions(routeActions, controllerActions) {
    let routeName = this.get('currentPath');
    later(() => {
      this.sendMessage('setActions', {
        routeName: routeName,
        routeActions: routeActions,
        controllerActions: controllerActions
      });
    }, 50);
  },

  sendDetectedAction(name, targetType, args) {
    args = keys(args || {}).map(key => args[key]);

    later(() => {
      this.sendMessage('actionDetected', {
        name: name,
        targetType: targetType,
        args: args,
        argsLength: args.length
      });
    }, 50);
  },

  messages: {
    watch() {
      this.prepareForRoute();
    },
    release() {
      this.releaseActions();
    }
  },

  watchActions(routeActions, controllerActions) {
    this.originalActions = {};
    this.originalActions.path = this.get('currentPath');

    let self = this;

    let origRouteActions = {};
    let origControllerActions = {};

    let routeActionsHash = this.get('routeActionsHash');
    let controllerActionsHash = this.get('controllerActionsHash');

    routeActions.forEach(function(action) {
      let name = action.name;
      let actionImpl = routeActionsHash[name];
      // backup original action implementation
      origRouteActions[name] = actionImpl;
      // wrap original implementation with action capturing
      routeActionsHash[name] = function() {
        self.sendDetectedAction(name, 'route', arguments);
        actionImpl.apply(this, arguments);
      };
    });

    this.originalActions.origRouteActions = origRouteActions;
  },

  releaseActions() {
    if (!this.originalActions) {
      return;
    }
    let routeName = this.originalActions.path;
    let route = this.get('container').lookup('route:' + routeName);
    let actions = route.get('_actions');
    for (let actionName in this.originalActions.origRouteActions) {
      actions[actionName] = this.originalActions.origRouteActions[actionName];
    }
  }
});