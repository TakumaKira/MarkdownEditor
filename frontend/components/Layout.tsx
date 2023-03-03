import React from 'react'
import { useAppSelector } from '../store/hooks'
import AuthModal from './AuthModal'
import ConfirmationModal from './ConfirmationModal'
import Frame from './Frame'
import MainView from './MainView'
import SafeArea from './SafeArea'
import SideBar from './SideBar'

const Layout = () => {
  const authState = useAppSelector(state => state.user.authState)
  const confirmationState = useAppSelector(state => state.document.confirmationState)

  return (
    <SafeArea>
      <Frame
        sidebar={SideBar}
        main={MainView}
      />
      {confirmationState &&
        <ConfirmationModal confirmationState={confirmationState} />
      }
      {authState &&
        <AuthModal />
      }
    </SafeArea>
  )
}

export default Layout