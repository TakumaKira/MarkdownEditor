import React from "react"
import { useAppDispatch } from "../store/hooks"
import { restoreDocument } from "../store/slices/document"
import { restoreTheme } from "../store/slices/theme"
import { restoreUser } from "../store/slices/user"

/** Dependent on redux store. */
const useRestore = (): void => {
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(restoreUser())
    dispatch(restoreDocument())
    dispatch(restoreTheme())
  }, [])
}
export default useRestore
