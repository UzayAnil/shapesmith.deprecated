define(['src/interactioncoordinator', 'src/geometrygraphsingleton'], 
    function(coordinator, geometryGraph) {

    var ItemModel = Backbone.Model.extend({

        initialize: function(attributes) {
            this.view = new ItemView({model: this});
        },

        click: function() {
            coordinator.initiateTool(this.name);
        },

    });

    var ItemView = Backbone.View.extend({

        tagName: "li",
        className: "item",

        initialize: function() {
            this.render();
            this.$el.addClass(this.model.name);
        },

        render: function() {
            $(this.el).html('<img src=/ui/images/icons/' + this.model.icon + '/>');
            return this;
        },

        events: {
            'click' : 'click',
        },

        click: function() {
            this.model.click();
        },

    });

    var Model = Backbone.Model.extend({

        initialize: function(attributes) {
            this.name = attributes.name;
            this.view = new View({model: this});
            $('body').append(this.view.$el);
            geometryGraph.on('vertexAdded', this.vertexAdded, this);
            geometryGraph.on('vertexRemoved', this.vertexRemoved, this);
        },

        addItem: function(itemModel) {
            this.view.$el.append(itemModel.view.$el);
        },

        vertexAdded: function(vertex) {
            if (geometryGraph.isEditing()) {
                this.view.$el.slideUp(100);
            }
        },

        vertexRemoved: function(vertex) {
            if (!geometryGraph.isEditing()) {
                this.view.$el.slideDown(100);
            }
        },

    });

    var View = Backbone.View.extend({

        tagName: "ol",
        className: "toolbar",

    });

    return  {
        ItemModel: ItemModel,
        ItemView: ItemView,
        Model: Model,
        View: View,
    }

    
});