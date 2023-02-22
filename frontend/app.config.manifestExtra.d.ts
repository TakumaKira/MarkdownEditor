export declare type ManifestExtra = {
  NODE_ENV: string
  /** Domain for api and websocket. */
  API_DOMAIN: string
  API_PROTOCOL: string
  API_PORT: number
  WS_PROTOCOL: string
  WS_PORT: number
  LOAD_STORYBOOK: boolean
  /** IP for Storybook development server. */
  STORYBOOK_UI_HOST_IP: string
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
  STATE_STORAGE_KEY_BASE: string
}
