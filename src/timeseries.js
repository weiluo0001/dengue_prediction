import React from 'react';
import { timeseriesStyle } from './style';


import {  XYPlot,
  		    XAxis,
          YAxis,
          VerticalGridLines,
          HorizontalGridLines,
          LineSeries,
          Crosshair
        } from 'react-vis';

export default function timeseries({
  RealCases,
  AR16Cases,
  mouseover,
  mouseoverIndex,
  filterpredictCases,
  filterealCases}) {

  var baseline = RealCases;
  var predictline = AR16Cases;

  if(filterealCases){
    baseline=filterealCases;
    predictline=filterpredictCases;
  } 

  const upperlimit = mouseoverIndex+4;
  const filteredData = mouseoverIndex === null ? null : predictline.filter(d => d.time > mouseoverIndex && d.time <= upperlimit);
  
  return (
  	<div style={timeseriesStyle}>
    <h2>Predictions in 4 weeks</h2>
    <XYPlot onMouseLeave={() => mouseover(null)}
            height={180} 
            width={1500}
            xType="time"
     margin={{left: 60, right: 25, top: 10, bottom: 25}}
    >
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis title="Time"/>
      <YAxis title="Cases"/>
      <LineSeries   
        onNearestXY={(value, {index}) =>mouseover(index)}
        className="first-series"
        data={baseline}
      />
      <LineSeries   
        className="second-series"
        color="red"
        data={filteredData}
      />
      <Crosshair values={[baseline[mouseoverIndex],
                          predictline[mouseoverIndex]]} />
    </XYPlot>
    </div>
  );
}