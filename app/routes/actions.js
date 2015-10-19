import TabRoute from 'ember-inspector/routes/tab';

export default TabRoute.extend({
  model() {
    return {};
  },

  setupController() {
    this._super(...arguments);
    this.get('port').on('action:setActions', this, this.setActions);
    this.get('port').send('action:getActions');
  },

  deactivate() {
    this.get('port').send('action:stopActions');
  },

  setActions(model) {
    console.log('Model:', model.routeName);
    this.set('controller.model', model);
  }
});
