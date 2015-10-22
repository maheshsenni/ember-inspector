import Ember from 'ember';
import TabRoute from 'ember-inspector/routes/tab';

const get = Ember.get;

export default TabRoute.extend({
  model() {
    return {
      definedActions: null,
      detectedActions: []
    };
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('action:setActions', this, this.setActions);
    this.get('port').on('action:actionDetected', this, this.addDetectedAction);
    this.get('port').send('action:watch');
  },

  deactivate() {
    this.get('port').send('action:release');
  },

  setActions(message) {
    this.set('controller.model.definedActions', message);
  },

  addDetectedAction(message) {
    this.get('controller.model.detectedActions').pushObject(message);
  },

  actions: {
    sendArgsToConsole(args) {
      console.log('TODO: Send object to console');
    }
  }
});
