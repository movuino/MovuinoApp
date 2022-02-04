import React, {  FunctionComponent } from "react";
import {
    Dimensions
} from "react-native";

import * as shape from 'd3-shape'

import { LineChart, StackedAreaChart } from 'react-native-svg-charts'

type ChartCardProps = {
    data: number[];
    lineColor: string;
}

const ChartCard:FunctionComponent<ChartCardProps> = (props) => {
    return (
    <LineChart
    data={props.data}
    width={Dimensions.get("window").width} // from react-native
    style={{height: 120, marginHorizontal: 20}}
    svg={{ stroke: props.lineColor, strokeWidth: 1 }}
    curve={shape.curveBasisOpen}
    contentInset={{ top: 20, left: 10, right: 10, bottom: 20 }}
  />

    )
}


export default ChartCard;