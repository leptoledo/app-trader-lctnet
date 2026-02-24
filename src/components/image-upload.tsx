"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
}

export function ImageUpload({ images, onImagesChange, maxImages = 3 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        try {
            const files = Array.from(e.target.files)
            const newImages: string[] = []

            for (const file of files) {
                // Convert to base64 for demo (in production, upload to Supabase Storage)
                const reader = new FileReader()
                const base64 = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.readAsDataURL(file)
                })
                newImages.push(base64)
            }

            const updatedImages = [...images, ...newImages].slice(0, maxImages)
            onImagesChange(updatedImages)

        } catch (error) {
            console.error("Erro ao fazer upload:", error)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index)
        onImagesChange(updated)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading || images.length >= maxImages}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {uploading ? "Enviando..." : `Adicionar Imagem (${images.length}/${maxImages})`}
                        </span>
                    </div>
                </label>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 33vw, 200px" />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
