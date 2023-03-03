import { Platform } from "react-native";
import { useNavigate } from "react-router-dom";

const _useNavigate = Platform.OS === 'web' ? useNavigate : () => () => {}

export { _useNavigate as useNavigate }
