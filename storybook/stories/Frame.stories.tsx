import { storiesOf } from '@storybook/react-native';
import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Frame from '../../components/Frame';

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 250,
    height: '100%',
    backgroundColor: '#1D1F22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarText: {
    color: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const MockSidebar = () =>
  <View style={styles.sidebarContainer}>
    <Text style={styles.sidebarText}>Sidebar</Text>
    <Text style={styles.sidebarText}>Menu</Text>
  </View>
const MockMain = (setShowSidebar: Dispatch<SetStateAction<boolean>>) =>
  <View style={styles.mainContainer}>
    <Button
      title="Sidebar Visibility Button"
      onPress={() => setShowSidebar(value => !value)}
    />
    <Text>Main</Text>
  </View>

storiesOf('Frame', module).add('to Storybook', () =>
  <Frame
    sidebar={MockSidebar}
    main={MockMain}
  />
);
