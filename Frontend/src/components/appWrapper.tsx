import React from 'react'

interface Props {
    children: React.ReactNode
}

const AppWrapper = ( { children }: Props ) => { // children because this will cater to all the pages and components that will be wrapped inside it
  return (
    <div className="h-full">
        <main className="lg:pl-10"> 
            {children} 
        </main>
    </div>
  )
}

export default AppWrapper