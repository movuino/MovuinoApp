
type RootStackParamList = {
    Discovering: undefined;
    Connecting: undefined;
    Home: undefined,
    ConnectionError: undefined
  };

  type SensorsStackParamList = {
    SensorHome: undefined;
    SensorScreen3Axis: {
        title: string,
        serviceUUID: string,
    };
  };

export type {RootStackParamList, SensorsStackParamList}