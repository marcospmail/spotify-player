import React from 'react'
import AppProvider from './src/hooks'
import * as eva from '@eva-design/eva'
import { ApplicationProvider as KittenAppProvider } from '@ui-kitten/components'
import mapping from './mapping.json'

import Home from './src/pages/Home'

const App: React.FC = () => {
  return (
    <KittenAppProvider {...eva} theme={eva.mapping} customMapping={mapping}>
      <AppProvider>
        <Home />
      </AppProvider>
    </KittenAppProvider>
  )
}

export default App
