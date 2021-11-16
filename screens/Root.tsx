import { Dimensions, TouchableOpacity, View } from 'react-native';

import Drawer from './home/Drawer';
import HomeScreen from './home';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SettingScreen from './settings';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { fontColor } from '../constants/styles';
import { observer } from 'mobx-react-lite';

const DrawerRoot = createDrawerNavigator();
const ScreenWidth = Dimensions.get('window').width;

type RootStackParamList = {
  Home: undefined;
  QRScan: undefined;
};

export default observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTransparent: false,
        headerTintColor: fontColor,
        swipeEdgeWidth: ScreenWidth * 0.37,
        drawerType: 'slide',
      }}
      drawerContent={Drawer}
    >
      <Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Wallet 3',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('QRScan')}
              style={{
                zIndex: 5,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingStart: 8,
                marginEnd: 17,
              }}
            >
              <MaterialCommunityIcons name="scan-helper" size={18} style={{}} />
              <View
                style={{ position: 'absolute', left: 2, right: 2.5, height: 1.5, backgroundColor: '#000', marginStart: 8 }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Screen name="Settings" component={SettingScreen} options={{ title: 'Settings' }} />
    </Navigator>
  );
});
