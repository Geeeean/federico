"use client"

import { useModals } from '@/app/hooks/useModals'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


type Props = {}

const Modals = (props: Props) => {
  const { modals, error, isLoading } = useModals()

  return (
    <div className="p-4 flex flex-col overflow-auto relative">
      {
        !isLoading ? (
          <Table>
            <TableCaption>Lista dei moduli ricevuti</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-right">Descrizione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                modals.map((modal: { name: string, telephone: string, email: string, description: string | null }, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium min-w-[200px] line-clamp-1">{modal.name}</TableCell>
                    <TableCell>{modal.email}</TableCell>
                    <TableCell>{modal.telephone}</TableCell>
                    <TableCell className='w-[600px]'>
                      <p className='line-clamp-1'>
                        {modal.description}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        ) : null
      }
    </div >
  )
}

export default Modals