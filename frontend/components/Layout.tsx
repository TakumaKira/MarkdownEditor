import React from 'react'
import { useAppSelector } from '../store/hooks'
import AuthModal from './AuthModal'
import { DocumentConfirmationModal } from './MessageModal'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'
import { AuthConfirmationModal } from './MessageModal'

const Layout = () => {
  const authState = useAppSelector(state => state.user.authState)
  const authConfirmationState = useAppSelector(state => state.user.confirmationState)
  const documentConfirmationState = useAppSelector(state => state.document.confirmationState)

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {authState &&
        <AuthModal />
      }
      {authConfirmationState &&
        <AuthConfirmationModal confirmationState={authConfirmationState} />
      }
      {documentConfirmationState &&
        <DocumentConfirmationModal confirmationState={documentConfirmationState} />
      }
    </SafeArea>
  )
}

export default Layout