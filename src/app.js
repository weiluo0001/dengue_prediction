/* global window */
import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  HEXAGON_CONTROLS
} from './controls';
import { tooltipStyle } from './style';
import DeckGL from 'deck.gl';
import { renderLayers } from './deckgl-layers';
import predData from '../data/dynamic_pointEstimates.csv';
//import 'mapbox-gl/dist/mapbox-gl.css';
import Timeseries from './timeseries';
//import staticData from '../../../data/0.001.csv';

const INITIAL_VIEW_STATE = {
  latitude: -14.2350,
  longitude: -51.9253,
  zoom: 3,
  bearing: 0,
  pitch: 0,
  minZoom: 2,
  maxZoom: 16
};

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    points: [],
    settings: Object.keys(HEXAGON_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: HEXAGON_CONTROLS[key].value
      }),
      {}
    ),
    mouseoverIndex: null,
    selectedIndex:null,
    mouseclickIndex: null,
    filterealCases: null,
    filterpredictCases: null,
    style: 'mapbox://styles/mapbox/light-v9'
  };

  componentDidMount() {
    this._processData();
  }

  _processData = () => {

      const data = predData.reduce((accu, curr) => {

      const longitude = Number(curr.longitude);
      const latitude = Number(curr.latitude); 
 

      const week = Number(curr.week);

      const dates = curr.date;
      accu.points.push({
        cityName:curr.location,
        position: [longitude, latitude],
        case: curr.case,
        time: week,
        date: dates,
        predict: false
      });

      accu.points.push({
        cityName:curr.location,
        position: [longitude,latitude],
        case: curr.AR_4w,
        time: week,
        date: dates,
        predict: true
      });


      const prevRealCases = accu.RealObj[dates] || 0;
      const prevAR16Cases = accu.AR16Obj[dates] || 0;

      accu.RealObj[dates] = prevRealCases + curr.case;
      accu.AR16Obj[dates] = prevAR16Cases + curr.AR_4w;

      return accu;
    }, 
    {
        points: [],
        RealObj: {},
        AR16Obj: {}
    }
    );

    var index = 0; 
    data.RealCases = Object.entries(data.RealObj).map(([dates, cases]) => {
      index = index + 1;
      return { time: Number(index), x: new Date(dates), y: cases };
    }
    );

    var index = 0;
    data.AR16Cases = Object.entries(data.AR16Obj).map(([dates, cases]) => {
      index = index + 1;
      return { time: Number(index), x: new Date(dates), y: cases };
    }
    );  

    /*data.static = staticData.reduce((accu, curr) => {

      const longitude = Number(curr.longitude);
      const latitude = Number(curr.latitude); 
      const year = Number(curr.week);
      const threshold = Number(curr.threshold);
      const original = Number(curr.original);
      const updated_16 = Number(curr.updated_16);
      const Dynamic_autoreggressive = Number(curr.Dynamic_autoreggressive);
      const Markov_3 = Number(curr.Markov_3);


      accu.points.push({
        cityName:curr.location,
        position: [longitude, latitude],
        year: year,
        threshold: threshold,
        original: original, 
        updated_16:  updated_16,
        Dynamic_autoreggressive: Dynamic_autoreggressive,
        Markov_3:Markov_3
      });
    },
    );*/

    this.setState(data);
  };

  _onHover({ x, y, object }) {

    const label = object ? (object.points[0].cityName) : null;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }

  _onClick(mouseclickIndex){

    const realdata = mouseclickIndex.filter (d => d.predict === false);
    const predictdata = mouseclickIndex.filter (d => d.predict === true);

    var index = 0;
    const filterealCases = realdata.map(x => {
      index = index + 1;
      return { time: Number(index), x: new Date(x.date), y: x.case };
    }
    );
    
    var index = 0;
    const filterpredictCases = predictdata.map(x => {
      index = index + 1;
      return { time: Number(index), x: new Date(x.date), y: x.case };
    }
    );


    this.setState({filterpredictCases});
    this.setState({filterealCases});
  }

  _onMouseover(mouseoverIndex) {
    this.setState({mouseoverIndex});
}

  _onSelect(selectedIndex) {
    this.setState({
      selectedIndex:
        selectedIndex === this.state.selectedIndex ?
          null :
          selectedIndex
    });
  }  

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  render() {
    const data = this.state.points;



    if (!data.length) {
      return null;
    }
    const { hover, settings } = this.state;
    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={HEXAGON_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <DeckGL 
          layers={renderLayers({
            data: this.state.points,
            index: this.state.mouseoverIndex|| this.state.selectedIndex,
            onHover: hover => this._onHover(hover),
            onClick: mouseclickIndex => this._onClick(mouseclickIndex),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <StaticMap mapStyle={this.state.style} />
        </DeckGL>
        <Timeseries {...this.state} 
        mouseover={index => this._onMouseover(index)}
        select={index => this._onSelect(index)}
        />
      </div>
    );
  }
}
