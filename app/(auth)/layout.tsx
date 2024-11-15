import Image from 'next/image'
import React from 'react'

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='flex min-h-screen' >
        <section className='bg-brand p-10'>
            <div>
                <Image src="/favicon.ico"
                alt="logo"
                width={16}
                height={16}
                className='h-auto'/>
                <div className='space-y-5 text-white'>
                    <h1 className='h1' >
                        Organise your files efficiently
                    </h1>
                    <p className='body-1'>
                        Store and manage all your files in one place.
                    </p>
                </div>
            </div>
        </section>
        {children}
    </div>
  )
}

export default Layout