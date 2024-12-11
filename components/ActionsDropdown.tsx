"use client";

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"  
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Image from 'next/image';
import { Models } from 'node-appwrite';
import { actionsDropdownItems } from '@/constants';
import Link from 'next/link';
import { constructDownloadUrl } from '@/lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { renameFile } from '@/lib/actions/file.actions';
import { usePathname } from 'next/navigation';
import { FileDetails, ShareInput } from './ActionsModalContent';
  

const ActionsDropdown = ({file}: {file: Models.Document}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [action, setAction] = useState<ActionType | null>(null);
    const [name, setName] = useState(file.name);
    const [isLoading, setiIsLoading] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);

    const path = usePathname();

    const closeAllModals = ()=>{
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        setAction(null);
        setName(file.name);
        //setEmals([]);
    }

    const handleAction = async ()=>{
        if(!action) return;
        setiIsLoading(true);
        let success = false;

        const actions = {
            rename: () => renameFile({fileId: file.$id, name, extension: file.extension, path: path}),
            share: () => console.log("share"),
            delete: () => console.log("delete"),
        };

        success = await actions[action.value as keyof typeof actions]();

        if(success) closeAllModals();

        setiIsLoading(false);
    };

    const handleRemoveUsers = ()=>{};

    const renderDialogContent = () => {

        if(!action) return null;

        const {value,label} = action;
        return (
            <DialogContent className='shad-dialog button' >
                <DialogHeader className='flex flex-col gap-3' >
                <DialogTitle className='text-center text-light-100' >
                    {label}
                </DialogTitle>
                {value === 'rename' && (
                    <Input
                    type='text'
                    value={name}
                    onChange={(e)=> setName(e.target.value)}
                    />
                )}
                {value === 'details' && <FileDetails file={file} />}
                {value === 'share' && (
                    <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUsers} />
                )}

                </DialogHeader>
                {['rename', 'share', 'delete'].includes(value) && (
                    <DialogFooter className='flex flex-col gap-3 md:flex-row' >
                        <Button  onClick={handleAction} className='modal-submit-button' >
                            <p className='capitalize' >{value}</p>
                            {isLoading && (
                                <Image
                                src={"/assets/icons/loader.svg"}
                                alt="Loading..."
                                width={24}
                                height={24}
                                className='animate-spin'
                                />
                            )}
                        </Button>
                        <Button onClick={closeAllModals} className='modal-cancel-button' >
                            Cancel
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        )
    }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} >

            <DropdownMenuTrigger className='shad-no-focus' >
                <Image
                src={"/assets/icons/dots.svg"}
                alt="..."
                width={34}
                height={34}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className='max-w-[200px] truncate' >{file.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actionsDropdownItems.map((actionItem) => (
                    <DropdownMenuItem key={actionItem.value} className='shadow-dropdown-item' onClick={()=>{
                        setAction(actionItem);

                        if(['rename',
                            'share',
                            "delete",
                            "details"].includes(actionItem.value)){
                                setIsModalOpen(true);
                            }
                    }} >
                        { actionItem.value === 'download' ? <Link href={constructDownloadUrl(file.bucketFileId)} download={file.name} className='flex items-center gap-2'>
                        <Image
                        src={actionItem.icon}
                        alt={actionItem.label}
                        width={30}
                        height={30}
                        />
                        {actionItem.label}
                        </Link> : <div className='flex items-center gap-2'>
                        <Image
                        src={actionItem.icon}
                        alt={actionItem.label}
                        width={30}
                        height={30}
                        />
                        {actionItem.label}
                        </div>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        {renderDialogContent()}
    </Dialog>

  )
}

export default ActionsDropdown