import { storiesOf } from '@storybook/react-native';
import { Dispatch, SetStateAction } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Frame from '../../components/Frame';
import { SIDEBAR_WIDTH } from '../../components/SideBar';

const styles = StyleSheet.create({
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
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
const MockMain = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>}) => {
  const {
    setShowSidebar,
  } = props

  return (
    <View style={styles.mainContainer}>
      <Button
        title="Sidebar Visibility Button"
        onPress={() => setShowSidebar(value => !value)}
      />
      <Text>Main</Text>
    </View>
  )
}

storiesOf('Frame', module).add('to Storybook', () =>
  <Frame
    sideBar={MockSidebar}
    main={MockMain}
  />
);
