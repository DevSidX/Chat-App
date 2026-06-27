import React from 'react'
import { AsideBar } from './AsideBar'

interface Props {
    children: React.ReactNode
}

const AppWrapper = ( { children }: Props ) => { // children because this will cater to all the pages and components that will be wrapped inside it
  return (
    <div className="h-full">
      <AsideBar />
        <main className="lg:pl-10 h-full"> 
            {children} 
        </main>
    </div>
  )
}

export default AppWrapper