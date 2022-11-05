export declare type ManifestExtra = {
  /** Domain for api and websocket. */
  API_DOMAIN: string
  API_PROTOCOL: string
  API_PORT: string
  WS_PROTOCOL: string
  WS_PORT: string
  LOAD_STORYBOOK: boolean
  /** IP for Storybook development server. */
  DEVELOPMENT_MACHINE_LOCAL_IP: string
  breakpoints: {
    MOBILE_TABLET: number
    TABLET_DESKTOP: number
  }
  /** Link for falling back native app rendering issue. */
  WEB_VERSION_URL: string
  NEW_DOCUMENT_TITLE: string
  INITIAL_DOCUMENTS: [
    {
      name: string
      content: string
    }
  ]
  STATE_STORAGE_KEY: string
  LOGIN_TOKEN_KEY: string
}
