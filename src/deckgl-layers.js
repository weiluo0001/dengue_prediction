import { ScatterplotLayer, HexagonLayer } from 'deck.gl';

const HEATMAP_COLORS = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [44, 127, 184],
  [37, 52, 148]
];

const LIGHT_SETTINGS = {
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const elevationRange = [0, 1000];

function calSum(points){
  var sum = 0;
  for(var i=0; i<points.length; i+=1){
    if(points[i].case){
    sum += points[i].case;
  }
  }
  return sum;
}

export function renderLayers(props) {
  const { data, index, onHover,onClick,settings } = props;

  //const realdata = data.filter (d => d.predict === false);

  const filteredData = index === null ? data : data.filter(d => d.date === data[index].date);


  return [
    /*settings.showScatterplot &&
      new ScatterplotLayer({
        id: 'scatterplot',
        getPosition: d => d.position,
        getFilledColor: d => (d.predict ? PICKUP_COLOR : DROPOFF_COLOR),
        getRadius: d => d.case,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 10,
        radiusMaxPixels: 100,
        data:filteredData,
        onHover,
        ...settings
      }),*/
    settings.showHexagon &&
      new HexagonLayer({
        id: 'heatmap',
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 2000,
        extruded: true,
        getPosition: d => d.position,
        getElevationValue: points => calSum(points),
        getColorValue: points => calSum(points),
        lightSettings: LIGHT_SETTINGS,
        opacity: 0.8,
        pickable: true,
        data: filteredData,
        onHover,
        onClick: info => onClick(info.object.points),
        ...settings
      })
  ];
}
