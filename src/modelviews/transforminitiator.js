define([
    'backbone',
    'selection',
    'scene',
    'scenevieweventgenerator',
    'geometrygraphsingleton',
    'asyncAPI',
    'modelviews/modelgraph',
    'modelviews/transforms/translatesceneview',
    'modelviews/transforms/uvwrotationsceneviews',
    'calculations',
    'settings',
  ], 
  function(
    Backbone, 
    selection, 
    sceneModel,
    sceneViewEventGenerator,
    geometryGraph,
    AsyncAPI,
    modelGraph,
    TranslateSceneView,
    UVWRotationSceneViews,
    calc,
    settings) {

  var Model = Backbone.Model.extend({

    initialize: function() {
      this.sceneViews = [];
      selection.on('selected', this.selected, this);
      selection.on('deselected', this.deselected, this);
    },

    deselected: function() {
      this.sceneViews.forEach(function(view) {
        view.remove();
      })
      this.sceneViews = [];
    },

    selected: function(_, selected) {
      if (selected.length === 1) {
        this.vertex = geometryGraph.vertexById(selected[0]);
        this.selectedModel = modelGraph.get(selected[0]);

        this.selectedModel.sceneView.on('dragStarted', this.dragStarted, this);
        this.selectedModel.sceneView.on('dragEnded', this.dragEnded, this);
        this.selectedModel.sceneView.on('drag', this.drag, this);

        this.sceneViews = [
          new TranslateSceneView({model: this}),
          new UVWRotationSceneViews.U({model: this}),
          new UVWRotationSceneViews.V({model: this}),
          new UVWRotationSceneViews.W({model: this}),
        ];
      } else {
        this.sceneViews.forEach(function(view) {
          view.remove();
        })
        this.sceneViews = [];

        this.selectedModel.sceneView.on('dragStarted', this.dragStarted, this);
        this.selectedModel.sceneView.on('dragEnded', this.dragEnded, this);
        this.selectedModel.sceneView.on('drag', this.drag, this);
        this.selectedModel = undefined;
      }
    },

    dragStarted: function() {
      this.initialTranslation = calc.objToVector(
        this.vertex.transforms.translate || {x:0,y:0,z:0}, 
        geometryGraph, 
        THREE.Vector3);
      this.originalVertex = this.vertex;
      this.originalVertex.transforming = true;
      this.editingVertex = AsyncAPI.edit(this.vertex);
      this.editingModel = modelGraph.get(this.editingVertex.id);
    },

    drag: function(position) {
      this.sceneViews.forEach(function(view) {
        view.remove();
      })
      this.sceneViews = [];

      if (!this.initialPosition) {
        this.initialPosition = position;
      }
      var diff = new THREE.Vector3().subVectors(position, this.initialPosition);
      var grid = settings.get('gridsize');
      var translation = new THREE.Vector3(Math.round(diff.x/grid) * grid,
                                          Math.round(diff.y/grid) * grid,
                                          Math.round(diff.z/grid) * grid).add(this.initialTranslation);

      this.editingModel.translate(translation);
    },

    dragEnded: function() {
      this.initialPosition = undefined;
      this.dragging = false;
      this.editingVertex.transforming = false;
      this.editingModel.tryCommit();
    },

  })

  

  return new Model();


});