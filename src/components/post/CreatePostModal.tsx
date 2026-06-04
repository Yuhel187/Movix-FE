"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    X,
    Image as ImageIcon,
    FileText,
    Loader2,
    Bold,
    Italic,
    Code,
    Link2,
    List,
    ListOrdered,
    Quote,
    Sigma,
    AlertTriangle,
    Film,
} from "lucide-react"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { useAuth } from "@/contexts/AuthContext"
import { blogService } from "@/services/blog.service"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"
import api from "@/lib/apiClient"


const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

interface CreatePostModalProps {
    setOpen: (open: boolean) => void
    onSuccess: () => void
    initialData?: {
        id?: string
        title?: string
        body?: string
        excerpt?: string
        isSpoiler?: boolean
        movieId?: string
        status?: string
        thumbnail?: string
        images?: string[]
    }
    groupId?: string
    groupName?: string
}

export default function CreatePostModal({
    setOpen,
    onSuccess,
    initialData,
    groupId,
    groupName
}: CreatePostModalProps) {
    const user = useAuth().user;

    const isEditing = !!initialData?.id

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [isSpoiler, setIsSpoiler] = useState(false)
    const [movieId, setMovieId] = useState("")
    const [images, setImages] = useState<File[]>([])
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("edit")

    // For movie search
    const [movieSearchText, setMovieSearchText] = useState("")
    const debouncedMovieSearch = useDebounce(movieSearchText, 300)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [movieResults, setMovieResults] = useState<any[]>([])
    const [isSearchingMovie, setIsSearchingMovie] = useState(false)
    const [showMovieDropdown, setShowMovieDropdown] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const movieSearchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchMovies = async () => {
            if (!debouncedMovieSearch.trim()) {
                setMovieResults([]);
                return;
            }
            setIsSearchingMovie(true);
            try {
                const res = await api.get(`/movies/search?q=${debouncedMovieSearch}`);
                setMovieResults(res.data?.movies || []);
                setShowMovieDropdown(true);
            } catch (err) {
                console.error("Failed to search movies", err);
            } finally {
                setIsSearchingMovie(false);
            }
        };
        fetchMovies();
    }, [debouncedMovieSearch]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (movieSearchRef.current && !movieSearchRef.current.contains(e.target as Node)) {
                setShowMovieDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "")
            setContent(initialData.body || "")
            setExcerpt(initialData.excerpt || "")
            setIsSpoiler(initialData.isSpoiler || false)
            setMovieId(initialData.movieId || "")
            if (initialData.thumbnail) setExistingThumbnail(initialData.thumbnail)
            if (initialData.images) setExistingImages(initialData.images)
        }
    }, [initialData])

    const applyWrapFormatting = (
        before: string,
        after: string,
        placeholder: string
    ) => {
        const textarea = textareaRef.current
        if (!textarea) return
        const { selectionStart, selectionEnd, value } = textarea
        const selectedText = value.slice(selectionStart, selectionEnd)
        const textToInsert = selectedText || placeholder
        const nextValue = `${value.slice(0, selectionStart)}${before}${textToInsert}${after}${value.slice(selectionEnd)}`
        setContent(nextValue)
        requestAnimationFrame(() => {
            const node = textareaRef.current
            if (!node) return
            const start = selectionStart + before.length
            const end = start + textToInsert.length
            node.focus()
            node.setSelectionRange(start, end)
        })
    }

    const applyLineFormatting = (
        formatter: (line: string, index: number) => string,
        placeholder: string
    ) => {
        const textarea = textareaRef.current
        if (!textarea) return
        const { selectionStart, selectionEnd, value } = textarea
        const selectedText = value.slice(selectionStart, selectionEnd) || placeholder
        const lines = selectedText.split("\n")
        const formatted = lines
            .map((line, index) => formatter(line.trim() || placeholder, index))
            .join("\n")
        const nextValue = `${value.slice(0, selectionStart)}${formatted}${value.slice(selectionEnd)}`
        setContent(nextValue)
        requestAnimationFrame(() => {
            const node = textareaRef.current
            if (!node) return
            const start = selectionStart
            const end = start + formatted.length
            node.focus()
            node.setSelectionRange(start, end)
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("")
        const files = e.target.files
        if (!files) return
        const newFiles: File[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setError(`Kích thước ảnh "${file.name}" vượt quá ${MAX_IMAGE_SIZE_MB}MB.`)
                return
            }
            if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
                setError("Chỉ cho phép file ảnh PNG, JPEG, GIF hoặc WebP.")
                return
            }
            newFiles.push(file)
        }
        const totalImages = images.length + newFiles.length
        if (totalImages > 11) {
            setError("Tối đa 1 ảnh bìa + 10 ảnh nội dung.")
            return
        }
        setImages([...images, ...newFiles])
        e.target.value = ""
    }

    const handleSubmit = async (status: "PUBLISHED" | "DRAFT" = "PUBLISHED") => {
        setError("")
        if (!title.trim()) return setError("Tiêu đề không được để trống.")
        const bodyContent = content.trim()
        if (!bodyContent) return setError("Nội dung không được để trống.")
        if (bodyContent.length < 10) return setError("Nội dung bài viết phải có ít nhất 10 ký tự.")

        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("title", title.trim())
            formData.append("content", bodyContent)
            formData.append("status", status)

            if (excerpt.trim()) {
                formData.append("excerpt", excerpt.trim())
            }
            formData.append("isSpoiler", String(isSpoiler))
            if (movieId.trim()) {
                formData.append("movieId", movieId.trim())
            }

            if (images.length > 0) {
                formData.append("thumbnail", images[0])
                for (let i = 1; i < images.length; i++) {
                    formData.append("images", images[i])
                }
            }

            if (isEditing && initialData?.id) {
                await blogService.updateBlogPost(initialData.id, formData)
                toast.success("Cập nhật bài viết thành công!")
            } else {
                await blogService.createBlogPost(formData)
                toast.success("Đăng bài viết thành công!")
            }

            setOpen(false)
            setTitle("")
            setContent("")
            setExcerpt("")
            setIsSpoiler(false)
            setMovieId("")
            setMovieSearchText("")
            setImages([])
            setExistingThumbnail(null)
            setExistingImages([])

            if (onSuccess) onSuccess()
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Đã có lỗi xảy ra.")
        } finally {
            setIsLoading(false)
        }
    }

    const removeFile = (indexToRemove: number) => {
        setImages(images.filter((_, index) => index !== indexToRemove))
    }

    return (
        <DialogContent className="dark sm:max-w-[700px] p-0 bg-[#0F0F0F] text-white border-zinc-800">
            <DialogHeader className="p-6 pb-2 border-b border-zinc-800">
                <DialogTitle className="text-center text-xl font-bold">
                    {isEditing
                        ? "Chỉnh sửa bài viết"
                        : groupName
                            ? `Đăng bài trong nhóm: ${groupName}`
                            : "Tạo bài viết"}
                </DialogTitle>
            </DialogHeader>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="hidden">
                    <TabsTrigger value="edit">Soạn thảo</TabsTrigger>
                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="p-6 pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user?.avatarUrl || undefined} />
                            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user?.username}</span>
                            {groupName && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span>Đăng trong</span>
                                    <span className="font-medium text-primary">{groupName}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="post-title" className="font-semibold">
                            Tiêu đề <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="post-title"
                            placeholder="Tóm tắt chủ đề bài viết của bạn"
                            value={title}
                            className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500"
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Content with Markdown toolbar */}
                    <div className="space-y-1.5">
                        <Label htmlFor="post-content" className="font-semibold">
                            Nội dung <span className="text-red-400">*</span>
                        </Label>
                        <div className="border border-zinc-700 rounded-md">
                            <div className="flex items-center gap-1 p-1 border-b border-zinc-700 bg-zinc-900 rounded-t-md flex-wrap">
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyWrapFormatting("**", "**", "in đậm")}><Bold className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyWrapFormatting("*", "*", "in nghiêng")}><Italic className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyWrapFormatting("`", "`", "code")}><Code className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyWrapFormatting("[", "](url)", "liên kết")}><Link2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyLineFormatting((line) => `- ${line.replace(/^[-*]\s+/, "")}`, "Mục danh sách")}><List className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyLineFormatting((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s+/, "")}`, "Mục danh sách")}><ListOrdered className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyLineFormatting((line) => `> ${line.replace(/^>\s?/, "")}`, "Trích dẫn")}><Quote className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => applyWrapFormatting("$$", "$$", "latex")}><Sigma className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={() => imageInputRef.current?.click()}><ImageIcon className="h-4 w-4" /></Button>
                            </div>
                            <Textarea
                                ref={textareaRef}
                                id="post-content"
                                placeholder="Chia sẻ kiến thức của bạn, có thể bao gồm hình ảnh hoặc công thức LaTeX."
                                className="min-h-[150px] w-full max-w-full border-none rounded-t-none px-2 shadow-none focus-visible:ring-0 resize-y whitespace-pre-wrap break-all bg-zinc-950 text-white placeholder-zinc-500"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1.5">
                        <Label htmlFor="post-excerpt" className="font-semibold">
                            Mô tả ngắn <span className="text-xs text-muted-foreground font-normal">(Không bắt buộc)</span>
                        </Label>
                        <Input
                            id="post-excerpt"
                            placeholder="Tóm tắt nội dung bài viết cho người đọc"
                            value={excerpt}
                            className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500"
                            onChange={(e) => setExcerpt(e.target.value)}
                        />
                    </div>

                    {/* Movie ID & Spoiler row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 relative" ref={movieSearchRef}>
                            <Label htmlFor="post-movie" className="font-semibold flex items-center gap-1.5">
                                <Film className="h-4 w-4" />
                                Liên kết phim <span className="text-xs text-muted-foreground font-normal">(Tìm kiếm theo tên phim)</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="post-movie"
                                    placeholder="Nhập tên phim để tìm..."
                                    value={movieSearchText}
                                    className="bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500"
                                    onChange={(e) => {
                                        setMovieSearchText(e.target.value);
                                        setShowMovieDropdown(true);
                                        // Reset movie id nếu người dùng xóa hết chữ
                                        if (!e.target.value.trim()) setMovieId("");
                                    }}
                                    onFocus={() => {
                                        if (movieResults.length > 0) setShowMovieDropdown(true);
                                    }}
                                />
                            </div>
                            
                            {/* Selected movie indicator */}
                            {movieId && !movieSearchText && (
                                <p className="text-xs text-yellow-500 mt-1">
                                    Đã chọn ID phim: {movieId} (Xóa để bỏ chọn)
                                </p>
                            )}

                            {/* Dropdown results */}
                            {showMovieDropdown && movieSearchText.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden">
                                    {isSearchingMovie ? (
                                        <div className="p-3 text-center text-sm text-zinc-400">Đang tìm kiếm...</div>
                                    ) : movieResults.length > 0 ? (
                                        <ul className="py-1">
                                            {movieResults.map((movie) => (
                                                <li
                                                    key={movie.id}
                                                    className="px-3 py-2 hover:bg-zinc-800 cursor-pointer flex items-center gap-2"
                                                    onClick={() => {
                                                        setMovieId(movie.id);
                                                        setMovieSearchText(movie.title);
                                                        setShowMovieDropdown(false);
                                                    }}
                                                >
                                                    {movie.poster_url && (
                                                        <img
                                                            src={movie.poster_url.startsWith('http') ? movie.poster_url : `https://image.tmdb.org/t/p/w200${movie.poster_url}`}
                                                            alt={movie.title}
                                                            className="w-8 h-10 object-cover rounded"
                                                        />
                                                    )}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm text-zinc-200 truncate">{movie.title}</span>
                                                        <span className="text-xs text-zinc-500">{new Date(movie.release_date).getFullYear() || "N/A"}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-3 text-center text-sm text-zinc-400">Không tìm thấy phim.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                Nội dung Spoiler?
                            </Label>
                            <Select
                                value={isSpoiler ? "true" : "false"}
                                onValueChange={(v) => setIsSpoiler(v === "true")}
                            >
                                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="dark bg-zinc-900 border-zinc-700 text-white">
                                    <SelectItem value="false">Không</SelectItem>
                                    <SelectItem value="true">Có — Đánh dấu spoiler</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Attached files */}
                    <div className="space-y-1.5">
                        <Label className="font-semibold">Ảnh đính kèm</Label>
                        <div className="flex flex-wrap gap-2">
                            {existingThumbnail && (
                                <Badge variant="outline" className="flex items-center gap-2 p-2">
                                    <ImageIcon className="h-4 w-4 text-green-500 shrink-0" />
                                    <span className="truncate text-xs">Ảnh bìa hiện tại</span>
                                    <button type="button" onClick={() => setExistingThumbnail(null)} className="shrink-0">
                                        <X className="h-4 w-4 cursor-pointer hover:text-red-500" />
                                    </button>
                                </Badge>
                            )}
                            {existingImages.map((url, idx) => (
                                <Badge key={`existing-${idx}`} variant="outline" className="flex items-center gap-2 p-2">
                                    <ImageIcon className="h-4 w-4 text-green-500 shrink-0" />
                                    <span className="truncate text-xs max-w-[120px]">Ảnh {idx + 1}</span>
                                    <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))} className="shrink-0">
                                        <X className="h-4 w-4 cursor-pointer hover:text-red-500" />
                                    </button>
                                </Badge>
                            ))}
                            {images.map((file, index) => (
                                <Badge key={`new-img-${index}`} variant="outline" className="flex items-center gap-2 p-2">
                                    <ImageIcon className="h-4 w-4 text-green-500 shrink-0" />
                                    <span className="truncate text-xs max-w-[120px]" title={file.name}>{file.name}</span>
                                    <button type="button" onClick={() => removeFile(index)} className="shrink-0">
                                        <X className="h-4 w-4 cursor-pointer hover:text-red-500" />
                                    </button>
                                </Badge>
                            ))}
                            {images.length === 0 && !existingThumbnail && existingImages.length === 0 && (
                                <p className="text-xs text-muted-foreground">Chưa có ảnh nào. Bấm nút ảnh trên toolbar để thêm.</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* TAB PREVIEW */}
                <TabsContent value="preview" className="p-6 pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
                    <Card className="w-full shadow-none border border-zinc-800 bg-zinc-950 text-white">
                        <CardHeader className="flex-row items-start gap-3 space-y-0">
                            <Avatar>
                                <AvatarImage src={user?.avatarUrl || undefined} />
                                <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{user?.username}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>Vừa xong</span>
                                    {isSpoiler && (
                                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px] py-0">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Spoiler
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-xl font-semibold mb-2">{title || "(Chưa có tiêu đề)"}</h2>
                            {excerpt && (
                                <p className="text-sm text-muted-foreground mb-3 italic">{excerpt}</p>
                            )}
                            <div className="mb-4">
                                {content && content.trim() ? (
                                    <MarkdownRenderer content={content} />
                                ) : (
                                    <p className="text-muted-foreground">
                                        Nội dung xem trước sẽ xuất hiện ở đây.
                                    </p>
                                )}
                            </div>

                            {/* Preview Images */}
                            {images.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {images.map((img, idx) => (
                                        <img
                                            key={`preview-new-img-${idx}`}
                                            src={URL.createObjectURL(img)}
                                            alt="Preview"
                                            className="max-h-96 max-w-full h-auto mx-auto rounded-md border border-zinc-800 object-contain"
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {error && (
                <p className="px-6 pb-4 text-center text-sm text-red-500">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-zinc-800 p-4">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}
                >
                    {activeTab === "edit" ? "Xem trước" : "Chỉnh sửa"}
                </Button>


                <Button
                    onClick={() => handleSubmit("PUBLISHED")}
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Lưu thay đổi" : "Đăng bài"}
                </Button>
            </div>

            <input
                type="file"
                ref={imageInputRef}
                accept="image/png, image/jpeg, image/gif, image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
        </DialogContent>
    )
}