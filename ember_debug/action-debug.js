import PortMixin from 'ember-debug/mixins/port-mixin';

const Ember = window.Ember;
const { Object: EmberObject, computed, observer, run: { later } } = Ember;
const { oneWay } = computed;

const keys = Object.keys || Ember.keys;

export default EmberObject.extend(PortMixin, {

  portNamespace: 'action',

  application: oneWay('namespace.application').readOnly(),

  port: oneWay('namespace.port').readOnly(),

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

  sendActions: observer('currentPath', function() {
    let routeName = this.get('currentPath');
    
    let route = this.get('container').lookup('route:' + routeName);
    let controller = this.get('container').lookup('controller:' + routeName);
    
    let routeActionsHash = route.get('_actions') || [];
    
    let systemDefinedActions = ['_super', 'finalizeQueryParamChange', 'queryParamsDidChange'];
    // remove system defined actions from actions names
    let routeActions = keys(routeActionsHash).removeObjects(systemDefinedActions).map(function(n) {
      return {
        name: n,
        target: 'route'
      }; 
    });

    let controllerActionsHash = controller.get('_actions') || [];

    let controllerActions = keys(controllerActionsHash).map(function(n) {
      return {
        name: n,
        target: 'controller'
      }; 
    });

    later(() => {
      this.sendMessage('setActions', {
        routeName: routeName,
        routeActions: routeActions,
        controllerActions: controllerActions
      });
    }, 50);
  }),

  messages: {
    getActions() {
      this.sendActions();
    },
    stopActions() {
      this.stopActionIntercept();
    }
  },

  // startActionIntercept(actionsHash) {
  //   this.originalActions = {};
  //   for (let actionName in actionsHash) {
  //     if (!actionsHash.hasOwnProperty(actionName)) {
  //       continue;
  //     }
  //     if (actionName !== 'queryParamsDidChange' && actionName !== 'finalizeQueryParamChange' && actionName !== '_super') {
  //       let action = actionsHash[actionName];
  //       this.originalActions[actionName] = action;
  //       console.log('Setting up action intercept:', actionName);
  //       actionsHash[actionName] = function() {
  //         console.log('Action intercepted - ' + actionName);
  //         action.apply(this, arguments);
  //       }
  //     }
  //   }
  // },

  // stopActionIntercept() {
  //   let routeName = this.get('currentPath');
  //   let route = this.get('container').lookup('route:' + routeName);
  //   let actions = route.get('_actions');
  //   for (let actionName in this.originalActions) {
  //     console.log('Stopping action intercept for: ', actionName);
  //     actions[actionName] = this.originalActions[actionName];
  //   }
  // }
});