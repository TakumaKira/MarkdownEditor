import React from "react"
import { useAppSelector } from "../store/hooks"
import { selectSelectedDocumentHasEdit } from "../store/slices/document"

/** Dependent on redux store. */
const useConfirmUnsavedDocument = () => {
  const hasEdit = useAppSelector(selectSelectedDocumentHasEdit)
  const confirmUnsavedDocument = React.useCallback((event: BeforeUnloadEvent): void => {
    event.preventDefault()
    if (!hasEdit) {
      return
    }
    // This shows confirmation dialog.
    event.returnValue = true
  }, [hasEdit])
  React.useEffect(() => {
    window.addEventListener?.('beforeunload', confirmUnsavedDocument)
    return () => window.removeEventListener?.('beforeunload', confirmUnsavedDocument)
  }, [confirmUnsavedDocument])
}
export default useConfirmUnsavedDocument
