define([
    'jquery',
    'lib/jquery.mustache',
    'calculations',
    'worldcursor',
    'scene',
    'geometrygraphsingleton',
    'modelviews/geomvertexMV', 
    'asyncAPI',
  ], 
  function(
    $, __$,
    calc,
    worldCursor,
    sceneModel,
    geometryGraph,
    GeomVertexMV,
    AsyncAPI) {

  // ---------- Editing ----------

  var EditingModel = GeomVertexMV.EditingModel.extend({

    initialize: function(options) {
      this.DOMView = EditingDOMView;
      this.SceneView = EditingSceneView;
      GeomVertexMV.EditingModel.prototype.initialize.call(this, options);
    },

    workplaneClick: function(position) {
      if (!this.vertex.proto) {
        this.tryCommit();
      }
    },

    translate: function(translation) {
      if (!this.startOrigin) {
        this.startOrigin = {
          x: this.vertex.transforms.translation.x,
          y: this.vertex.transforms.translation.y,
          z: this.vertex.transforms.translation.z,
        }
        this.startRotationCenter = {
          x: this.vertex.transforms.rotation.origin.x,
          y: this.vertex.transforms.rotation.origin.y,
          z: this.vertex.transforms.rotation.origin.z, 
        }
      }
      this.vertex.transforms.translation =  {
        x: this.startOrigin.x + translation.x,
        y: this.startOrigin.y + translation.y,
        z: this.startOrigin.z + translation.z,
      };
      this.vertex.transforms.rotation.origin =  {
        x: this.startRotationCenter.x + translation.x,
        y: this.startRotationCenter.y + translation.y,
        z: this.startRotationCenter.z + translation.z,
      };
      this.vertex.trigger('change', this.vertex);
    },

  });

  var EditingDOMView = GeomVertexMV.EditingDOMView.extend({

    render: function() {
      GeomVertexMV.EditingDOMView.prototype.render.call(this);
      var template = 
        this.beforeTemplate +
        '<div>dx<input class="field dx" type="text" value="{{dx}}"></input></div>' +
        '<div>dy<input class="field dy" type="text" value="{{dy}}"></input></div>' +
        '<div>dz<input class="field dz" type="text" value="{{dz}}"></input></div>' + 
        this.afterTemplate;

      var translation = this.model.vertex.transforms.translation;
      var view = _.extend(this.baseView, {
        dx     : translation.x,
        dy     : translation.y,
        dz     : translation.z,
      });
      this.$el.html($.mustache(template, view));
      return this;
    },

    update: function() {
      GeomVertexMV.EditingDOMView.prototype.update.call(this);

      var that = this;
      var translate = this.model.vertex.transforms.translate || {x:0, y:0, z:0};
      ['x', 'y', 'z'].forEach(function(key) {
        that.$el.find('.field.d' + key).val(translate[key]);
      });
    },

    updateFromDOM: function() {
      GeomVertexMV.EditingDOMView.prototype.updateFromDOM.call(this);
      
      var that = this;
      var translate = this.model.vertex.transforms.translate || {x:0, y:0, z:0};
      ['x', 'y', 'z'].forEach(function(key) {
        try {
          var expression = that.$el.find('.field.d' + key).val();
          translate[key] = expression;
        } catch(e) {
          console.error(e);
        }
      });
      this.model.vertex.trigger('change', this.model.vertex);
    },

  });

  var EditingSceneView = GeomVertexMV.EditingSceneView.extend({

    render: function() {
      GeomVertexMV.EditingSceneView.prototype.render.call(this);
      var that = this;
      this.createMesh(function(result) {
        that.renderMesh(result);
      });
    },

  });

  // ---------- Display ----------

  var DisplayModel = GeomVertexMV.DisplayModel.extend({

    initialize: function(options) {
      this.SceneView = DisplaySceneView;
      GeomVertexMV.DisplayModel.prototype.initialize.call(this, options);
    },

    destroy: function() {
      GeomVertexMV.DisplayModel.prototype.destroy.call(this);
    },

  });

  var DisplaySceneView = GeomVertexMV.DisplaySceneView.extend({

    render: function() {
      GeomVertexMV.DisplaySceneView.prototype.render.call(this);
      var that = this;
      this.createMesh(function(result) {
        that.renderMesh(result);
      });
    },

  });

  // ---------- Module ----------

  return {
    DisplayModel: DisplayModel,
    EditingModel: EditingModel,
  } 

});
