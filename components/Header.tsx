import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import Search from "./Search"
import FileUploader from './FileUploader'
import { Sign } from 'crypto'
import { signOutUser } from '@/lib/actions/users.actions'

const Header = () => {
  return <header className='header'>
    <Search/>
    <div className='header-wrapper' >
      <FileUploader/>
      <form action={ async ()=> {
        "use server";

        await signOutUser();
      } } >
        <Button type='submit' className='sign-out-button'>
          <Image src="/assets/icons/logout.svg" alt="logout" width={24} height={24} className="w-6"/>
        </Button>
      </form>
    </div>
  </header>
}

export default Header