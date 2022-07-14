import React from "react"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { selectColorScheme, toggleTheme } from "../../store/slices/theme"

const ThemeWrapper = (props: {children: (colorScheme: 'light' | 'dark') => JSX.Element, isDark?: boolean}) => {
  const colorScheme = useAppSelector(selectColorScheme)
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    if (
      (colorScheme === 'light' && props.isDark)
      || (colorScheme === 'dark' && !props.isDark)
    ) {
      dispatch(toggleTheme())
    }
  }, [props.isDark])
  return props.children(colorScheme)
}
export default ThemeWrapper