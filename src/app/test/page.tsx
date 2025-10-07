"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CountrySelect } from "@/components/movie/CountrySelect"
import { GenreSelect } from "@/components/movie/GenreSelect"
import { YearSelect } from "@/components/movie/YearSelect"
import { MonthSelect } from "@/components/movie/MonthSelect"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { InputGroup, InputGroupAddon,InputGroupButton,InputGroupInput,InputGroupText,InputGroupTextarea } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"


import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function TestPage() {
  return (
    <div className="dark p-10 space-y-4 min-h-screen bg-background text-foreground">
      <Button>Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Input placeholder="Type here..." />

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CountrySelect />
      <GenreSelect />
      <YearSelect />
      <MonthSelect />
      <Skeleton className="h-10 w-48" />
      <Textarea placeholder="Type your message here..." className="w-full h-24" />

      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>

        <InputOTPSeparator />

        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      
      <button onClick={() => toast.success("Success!")}>Show Success Toast</button>
      <button onClick={() => toast.error("Error!")}>Show Error Toast</button>
      <Toaster position="top-right"/>

      <InputGroup className="w-80">
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput placeholder="Amount" />
        <InputGroupButton onClick={() => toast("Submitted!")}>Submit</InputGroupButton>
      </InputGroup>

      <InputGroup className="w-96">
        <InputGroupTextarea placeholder="Your message..." />
        <InputGroupAddon align="block-end">
          <InputGroupText>Helper text</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
