import {
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
} from "react-native";
import React, { FunctionComponent } from "react";
import Icon from "react-native-vector-icons/AntDesign";
import FeatherIcon from 'react-native-vector-icons/Feather';

type ScreenHeaderProps = {
    title?: string;
    onBack: () => void;
    showSettings?: boolean; 
}

const ScreenHeader:FunctionComponent<ScreenHeaderProps> = props => {

    const styles = StyleSheet.create({
        container: {
          marginBottom: 30,
        },
        titleWrapper: {
            marginTop: 10,
            flexDirection: 'row'
        },
        title: {
            fontFamily: "Nunito",
            fontSize: 46,
            fontWeight: "600",
            marginLeft: 30
        },
        topBar: {
            flexDirection: 'row'
        }
    })

    return (
    <View style={styles.container}>
        <View style={styles.topBar}>
            <View style={{marginLeft: 10, width: 60, height: 40, alignItems: "center", justifyContent:"center"}}>
                <TouchableOpacity onPress={props.onBack} activeOpacity={0.3}>
                    <Icon name='arrowleft' size={35}/>
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}}></View>
            <View style={{marginRight: 10, width: 60, height: 40, alignItems: "center", justifyContent:"center"}}>
                {(props.showSettings === undefined || props.showSettings) && 
                <TouchableOpacity onPress={() => {}} activeOpacity={0.3}>
                    <FeatherIcon name='settings' size={25}/>
                </TouchableOpacity>
                }
            </View>
        </View>
        {
        props.title !== undefined &&
        <View style={styles.titleWrapper}>
            <Text style={styles.title}>{props.title}</Text>
        </View>
        }
    </View>
    )
}

export default ScreenHeader;
