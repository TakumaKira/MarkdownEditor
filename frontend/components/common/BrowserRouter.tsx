import { Platform } from "react-native";
import { BrowserRouter } from "react-router-dom";

const _BrowserRouter = Platform.OS === 'web' ? BrowserRouter : (props: {children: JSX.Element}) => <>{props.children}</>

export { _BrowserRouter as BrowserRouter }
