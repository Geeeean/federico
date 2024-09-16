"use client"

import { useModals } from '@/app/hooks/useModals'
import { useRemoveModal } from '@/app/hooks/useRemoveModal'
import { useToggleModal } from '@/app/hooks/useToggleModal'
import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from 'react'

type Props = {}

type Modal = {
  id: number;
  name: string;
  telephone: string;
  email: string;
  description: string | null;
  viewed: boolean;
}

type ModalProps = {
  modal: Modal,
  setOpen: (val: boolean) => void,
  setModal: (val: Modal) => void
}

const ModalCard = ({ modal, setModal, setOpen }: ModalProps) => {
  const { removeModal, isPending, isSuccess } = useRemoveModal()
  const { toggleModal } = useToggleModal()

  return < TableRow key={modal.id} className='group'>
    <TableCell className="font-medium min-w-[200px] line-clamp-1">{modal.name}</TableCell>
    <TableCell>{modal.email}</TableCell>
    <TableCell>{modal.telephone}</TableCell>
    <TableCell className='w-[300px]'>
      <p className='line-clamp-1'>
        {modal.description}
      </p>
    </TableCell>
    <TableCell className='flex gap-6 justify-end'>
      <span className='cursor-pointer' onClick={() => {
        setOpen(true)
        setModal(modal)
      }}>Apri</span>
      <span className='cursor-pointer text-red-700' onClick={() => removeModal({ id: modal.id })}>Rimuovi</span>
      <span className='cursor-pointer text-blue-700' onClick={() => toggleModal({ id: modal.id, newViewed: !modal.viewed })}>
        {modal.viewed ? "Segna come non visto" : "Segna come già visto"}
      </span>
    </TableCell>
  </TableRow >
}

const Modals = (props: Props) => {
  const { modals, error, isLoading } = useModals()
  const [open, setOpen] = useState<boolean>()
  const [activeModal, setActiveModal] = useState<Modal>({ id: -1, description: "", email: "", name: "", telephone: "", viewed: false })

  return (
    <div className="p-4 flex flex-col gap-36 overflow-auto relative">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form di contatto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <p className='text-sm text-muted-foreground'>Nome</p>
              <p>{activeModal.name}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Email</p>
              <p>{activeModal.email}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Telefono</p>
              <p>{activeModal.telephone}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Descrizione</p>
              <p>{activeModal.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {
        !isLoading ? (
          <>
            <Table>
              <TableCaption>Lista dei moduli da leggere</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  modals.filter((modal: { viewed: boolean }) => !modal.viewed).map((modal: Modal, index: number) => {
                    return <ModalCard modal={modal} key={index} setOpen={setOpen} setModal={setActiveModal} />
                  })
                }
              </TableBody>
            </Table>
            <Table>
              <TableCaption>Lista dei moduli già letti</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  modals.filter((modal: { viewed: boolean }) => modal.viewed).map((modal: { id: number, name: string, telephone: string, email: string, description: string | null, viewed: boolean }, index: number) => {
                    return <ModalCard modal={modal} key={index} setOpen={setOpen} setModal={setActiveModal} />
                  })
                }
              </TableBody>
            </Table>
          </>
        ) : null
      }
    </div >
  )
}

export default Modals