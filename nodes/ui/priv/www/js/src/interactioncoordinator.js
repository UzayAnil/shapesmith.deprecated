 define(['src/geometrygraph', 'src/selection', 'src/scenevieweventgenerator'], 
    function(geometryGraph, selection, sceneViewEventGenerator) {

    var Coordinator = function() {
        _.extend(this, Backbone.Events);

        var dragThreshold = 10;
        var dragging = false;

        var that = this;
        window.addEventListener('keydown', function(event) {
            that.trigger('keydown', event);
        }, false);

        $('#scene').mousemove(function(event) {
            that.mousemove(event);
        });
        $('#scene').mouseup(function(event) {
            that.trigger('mouseup', event);
            that.mouseup(event);
        });
         $('#scene').mouseleave(function(event) {
            that.mouseleave(event);
        });
        $('#scene').mousedown(function(event) {
            that.trigger('mousedown', event);
            that.mousedown(event);
        });
        $('#scene').mousewheel(function(event) {
            that.trigger('mousewheel', event);
        });

        this.mousemove = function(event) {
            if (this.overThreshold(eventToPosition(event))) {
                event.mouseDownEvent = this.mouseDownEvent;
                dragging = true;
                this.trigger('drag', event);
            } else {
                this.trigger('mousemove', event);
                sceneViewEventGenerator.mousemove(event);
                if (sceneViewEventGenerator.overClickable()) {
                    $('#scene').css('cursor', 'pointer');
                } else {
                    $('#scene').css('cursor', '');
                }
            } 

        }

        this.mouseup = function(event) {
            if (!dragging) {
                this.trigger('click', event);
                if (!sceneViewEventGenerator.click(event)) {
                    selection.deselectAll();
                }
            }
            this.mouseDownEvent = undefined;
            dragging = false;
        }

        this.mouseleave = function(event) {
            this.mouseDownEvent = undefined;
            dragging = false;
        }

        this.mousedown = function(event) {
            this.mouseDownEvent = event;
        }


        this.initiateTool = function(name) {
            selection.deselectAll();
            if (name === 'point') {
                geometryGraph.createPointPrototype();
            }
            if (name === 'line') {
                geometryGraph.createLinePrototype();
            }
        }

        this.overThreshold = function(pos2) {
            if (!this.mouseDownEvent) {
                return false;
            }
            var pos1 = eventToPosition(this.mouseDownEvent);
            var dx = Math.abs(pos1.x - pos2.x);
            var dy = Math.abs(pos1.y - pos2.y);
            return Math.sqrt(dx*dx + dy*dy) > dragThreshold;
        };
    }

    var eventToPosition = function(event) {
        return {
            x: event.clientX,
            y: event.clientY,
        };
    }

    return new Coordinator();
});