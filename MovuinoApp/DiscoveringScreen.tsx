import React, {
  useEffect,
  useState,
  FunctionComponent,
  useRef,
  useLayoutEffect,
  useContext,
} from 'react';

import {BleManager, Device} from 'react-native-ble-plx';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  View,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  Image,
  Text,
  RefreshControl,
} from 'react-native';

import AppContext from './Context';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-community/masked-view';

import {
  CONNECTIN_PAGE,
} from './constants';

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

type RootStackParamList = {
  Discovering: undefined;
  Connecting: undefined;
  Home: undefined;
  ConnectionError: undefined;
};

type ListItemProps = {
  title: String | null;
  device: Device;
  onDeviceSelected: (device: Device) => void;
};

const ListItem: FunctionComponent<ListItemProps> = ({
  title,
  device,
  onDeviceSelected,
}) => (
  <View style={{marginHorizontal: 20, marginVertical: 8}}>
    <TouchableHighlight
      onPress={() => {
        onDeviceSelected(device);
      }}
      activeOpacity={0.8}
      underlayColor="#DDDDDD"
      style={{borderRadius: 15}}>
      <View style={{backgroundColor: '#F8F9FD', padding: 20, borderRadius: 15}}>
        <Text style={styles.deviceName}>{device.name}</Text>
      </View>
    </TouchableHighlight>
  </View>
);

type DummySpacerProps = {
  height: string | number | undefined;
};

const DummySpacer: FunctionComponent<DummySpacerProps> = props => {
  return <View style={{height: props.height}}></View>;
};

type DiscoveringDeviceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Discovering'
>;

const BleDiscoveringScreen = ({
  route,
  navigation,
}: DiscoveringDeviceScreenProps) => {
  const {bleManager, setDeviceSelected} = useContext(AppContext); // Retrieve BleManager from Context
  const [loadingDots, setLoadingDots] = useState(1); // Define State used to show then ... animation
  const [devicesDiscovered, setDevicesDiscovered] = useState<Device[]>([]); // Array containing the devices discovered (used to render the list)
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useInterval(
    () => setLoadingDots(curr => (curr < 3 ? loadingDots + 1 : 1)),
    1000,
  ); // Interval used for the ... animation

  const scan = () => {
    console.log(navigation, route);
    bleManager?.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      if (device === null || device.name === null) return;

      setDevicesDiscovered(curr => {
        // Update the State array with the newly discovered device
        if (curr.find(d => d.id === device.id) === undefined)
          return [...curr, device];
        return curr;
      });
    });
  };
  useEffect(() => {
    const subscription = bleManager?.onStateChange(state => {
      if (state === 'PoweredOn') {
        scan();
        subscription?.remove();
      }
    }, true);
  }, []);

  const renderItem = (
    {item}: {item: Device},
    onDeviceSelected: (device: Device) => void,
  ) => (
    <ListItem
      device={item}
      title={item.name}
      onDeviceSelected={onDeviceSelected}></ListItem>
  );

  const onDeviceSelected = (device: Device) => {
    // Function called when a list item is pressed
    bleManager?.stopDeviceScan(); //  Stop the scan and set deviceSelected in the context
    setDeviceSelected(device);
    navigation.navigate(CONNECTIN_PAGE as never, {} as never); // TS typing bug => hacky patch :D
  };

  const onRefresh = () => {
    setRefreshing(true);
    bleManager?.stopDeviceScan();
      setDevicesDiscovered([]);
    setTimeout(() => {
      setRefreshing(false)
      scan();
    }, 500)
    

  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('./assets/images/bluetoothConnectingScreen.png')}
        />
        <Text style={styles.title}>Please select your Movuino</Text>
        <Text style={styles.info}>I don't have a movuino to test on</Text>
        <Text style={styles.subtitle}>
          Discovering {'.'.repeat(loadingDots)}
        </Text>
      </View>
      <View style={styles.list}>
        <MaskedView
          maskElement={
            <LinearGradient
              colors={['#FFFFFF00', '#FFFFFF', '#FFFFFF', '#FFFFFF00']}
              locations={[0, 0.1, 0.9, 1]}
              style={styles.linearGradient}></LinearGradient>
          }>
          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}
            data={devicesDiscovered}
            ListHeaderComponent={<DummySpacer height={30} />}
            ListFooterComponent={<DummySpacer height={30} />}
            renderItem={({item}) => renderItem({item}, onDeviceSelected)}
          />
        </MaskedView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: '#F8F9FD',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    marginHorizontal: 20,
  },
  header: {
    flex: 0.7,
    fontSize: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Nunito',
  },
  linearGradient: {
    flex: 1,
    width: '100%',
  },
  title: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Nunito',
  },
  subtitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Nunito',
  },
  info: {
    fontWeight: '600',
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'Nunito',
    color: '#4A78FF',
    textDecorationLine: 'underline',
  },
});

export default BleDiscoveringScreen;
