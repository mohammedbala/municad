import { Feature } from 'geojson';

interface DrawState {
  rectangle: any;
  startPoint: [number, number] | null;
}

export const DrawRectangleMode = {
  onSetup: function(): DrawState {
    const rectangle = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    });

    this.addFeature(rectangle);
    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });
    this.activateUIButton('rectangle');

    return {
      rectangle,
      startPoint: null
    };
  },

  onClick: function(state: DrawState, e: { lngLat: { lng: number; lat: number } }): void {
    if (!state.startPoint) {
      state.startPoint = [e.lngLat.lng, e.lngLat.lat];
      state.rectangle.updateCoordinate('0.0', e.lngLat.lng, e.lngLat.lat);
    } else {
      // Complete the rectangle
      this.changeMode('simple_select', { featureIds: [state.rectangle.id] });
      this.map.fire('draw.create', {
        features: [state.rectangle.toGeoJSON()]
      });
    }
  },

  onMouseMove: function(state: DrawState, e: { lngLat: { lng: number; lat: number } }): void {
    if (state.startPoint) {
      const [startX, startY] = state.startPoint;
      const endX = e.lngLat.lng;
      const endY = e.lngLat.lat;

      // Create rectangle coordinates
      state.rectangle.updateCoordinate('0.0', startX, startY);
      state.rectangle.updateCoordinate('0.1', endX, startY);
      state.rectangle.updateCoordinate('0.2', endX, endY);
      state.rectangle.updateCoordinate('0.3', startX, endY);
      state.rectangle.updateCoordinate('0.4', startX, startY);
    }
  },

  onStop: function(state: DrawState): void {
    this.activateUIButton();
    if (!state.rectangle.isValid()) {
      this.deleteFeature([state.rectangle.id], { silent: true });
    }
  },

  toDisplayFeatures: function(state: DrawState, geojson: Feature, display: (feature: Feature) => void): void {
    const isActiveRectangle = geojson.properties?.id === state.rectangle.id;
    geojson.properties.active = isActiveRectangle ? 'true' : 'false';
    display(geojson);
  }
};