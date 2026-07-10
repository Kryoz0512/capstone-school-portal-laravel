export const convertToWebP = (file: File, quality = 0.9): Promise<File> => {
    return new Promise((resolve, reject) => {
        // If it's already a webp, just return it
        if (file.type === 'image/webp') {
            resolve(file)
            return
        }

        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            ctx.drawImage(img, 0, 0)

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob failed'))
                        return
                    }

                    // Create a new File from the blob with the same name but .webp extension
                    const originalName = file.name.replace(/\.[^/.]+$/, '')
                    const newFile = new File([blob], `${originalName}.webp`, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    })
                    
                    resolve(newFile)
                },
                'image/webp',
                quality
            )
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image for conversion'))
        }

        img.src = url
    })
}
