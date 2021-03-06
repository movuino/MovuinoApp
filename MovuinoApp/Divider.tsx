import React, {  FunctionComponent } from "react";
import {
	View,
	ColorValue,
	StyleProp,
	ViewStyle,
} from "react-native";


type DividerProps = {
    style?: StyleProp<ViewStyle>;
    color?: ColorValue | undefined;
}

const Divider:FunctionComponent<DividerProps> = (props) => {
    return (<View
        style={[{
          borderBottomColor: props.color || 'black',
          borderBottomWidth: 1,
        }, props.style]}
      />)
}

export default Divider;