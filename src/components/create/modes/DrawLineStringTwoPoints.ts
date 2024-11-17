import { Feature } from 'geojson';

interface DrawState {
  line: any;
  currentVertexPosition: number;
}

export const DrawLineStringTwoPoints = {
  onSetup: function(): DrawState {
    const line = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    });

    this.addFeature(line);
    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });
    this.activateUIButton('line_string');

    return {
      line,
      currentVertexPosition: 0
    };
  },

  onClick: function(state: DrawState, e: { lngLat: { lng: number; lat: number } }): void {
    state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
    state.currentVertexPosition++;

    if (state.currentVertexPosition > 1) {
      this.changeMode('simple_select', { featureIds: [state.line.id] });
      this.map.fire('draw.create', {
        features: [state.line.toGeoJSON()]
      });
    }
  },

  onMouseMove: function(state: DrawState, e: { lngLat: { lng: number; lat: number } }): void {
    if (state.currentVertexPosition === 1) {
      state.line.updateCoordinate(1, e.lngLat.lng, e.lngLat.lat);
    }
  },

  onStop: function(state: DrawState): void {
    this.activateUIButton();
    if (!state.line.isValid()) {
      this.deleteFeature([state.line.id], { silent: true });
    }
  },

  toDisplayFeatures: function(state: DrawState, geojson: Feature, display: (feature: Feature) => void): void {
    const isActiveLine = geojson.properties?.id === state.line.id;
    geojson.properties.active = isActiveLine ? 'true' : 'false';
    display(geojson);
  }
};