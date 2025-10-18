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
import { SearchBar } from "@/components/common/search-bar"
import { NotificationIcon } from "@/components/common/noti-icon"
import { TagItem } from "@/components/common/TagItem"
import { ActorCard } from "@/components/movie/ActorCard"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { MovieCategoryCard } from "@/components/movie/MovieCategoryCardProps"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useState } from "react"
import { ArrowNavigation } from "@/components/movie/ArrowNavigation"
import { MovieSearchCard } from "@/components/movie/MovieSearchCard"

export default function TestPage() {
  const [tags, setTags] = useState([
    { id: 1, label: "Kinh dị" },
    { id: 2, label: "Trinh thám" },
    { id: 3, label: "Tình cảm" },
  ])
  const removeTag = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id))
  }
  const trendingActionMovies = [
  { id: "1", title: "Movie 1", posterUrl: "/path/movie1.jpg" },
  { id: "2", title: "Movie 2", posterUrl: "/path/movie2.jpg" },
  { id: "3", title: "Movie 3", posterUrl: "/path/movie3.jpg" },
  { id: "4", title: "Movie 4", posterUrl: "/path/movie4.jpg" },
];
const allMovies = [
  {
    title: "Hồi sinh thế giới",
    subTitle: "Dr. STONE",
    imageUrl: "/favicon.ico",
    season: "4",
    episode: "24",
  },
  {
    title: "Thanh gươm diệt quỷ",
    subTitle: "Kimetsu no Yaiba",
    imageUrl: "/favicon.ico",
    season: "3",
    episode: "11",
  },
]
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

      <SearchBar></SearchBar>
      <NotificationIcon></NotificationIcon>
      <div className="flex">
        <ActorCard name="Quang Khải" imageUrl="/favicon.ico"/>
        <ActorCard name="Quang Khải" imageUrl="/favicon.ico"/>
      </div>
      
      <ActorCard layout="horizontal" name="Quang Khải" imageUrl="/favicon.ico"/>
      <div className="flex flex-wrap gap-3">
      {tags.map(tag => (
        <TagItem
          key={tag.id}
          label={tag.label}
          variant="active"
          onRemove={() => removeTag(tag.id)}
        />
      ))}
      <TagItem label="Thêm tag..." variant="default" />
    </div>

    <MovieCategoryCard category="Hành động" movies={trendingActionMovies} onClickMore={() => console.log("Xem thêm")}/>
    <ArrowNavigation/>
     <div className="w-full max-w-md flex flex-col gap-3 mt-2">
        {allMovies.map((movie, index) => (
          <MovieSearchCard key={index} {...movie} />
        ))}
      </div>
    </div>
  )
}
