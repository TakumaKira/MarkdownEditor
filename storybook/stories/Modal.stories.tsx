import { View, Text, StyleSheet } from 'react-native'
import { storiesOf } from '@storybook/react-native';
import Modal from '../../components/Modal';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  modalContent: {
    height: 218,
    width: 343,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
})

storiesOf('Modal', module).add('to Storybook', () =>
  <View style={styles.container}>
    <Text>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!</Text>
    <Text>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!</Text>
    <Text>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!</Text>
    <Text>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!</Text>
    <Text>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!</Text>
    <Modal><View style={styles.modalContent} /></Modal>
  </View>
);
