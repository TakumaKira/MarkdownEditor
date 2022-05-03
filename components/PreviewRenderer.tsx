import { Text, View } from 'react-native'

const PreviewRenderer = (props: {input: string}) => {
  const {
    input,
  } = props
  return (
    <View>{input.split('\n').map((line, i) => <Text key={i}>{line}</Text>)}</View>
  )
}

export default PreviewRenderer