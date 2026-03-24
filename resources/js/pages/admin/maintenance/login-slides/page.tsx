import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { FormEventHandler } from 'react'

// Helper to generate routes
const route = (name: string, params?: any) => {
    const routes: Record<string, string> = {
        'admin.maintenance.login-slides.store': '/admin/maintenance/login-slides',
        'admin.maintenance.login-slides.destroy': `/admin/maintenance/login-slides/${params}`,
        'admin.maintenance.login-slides.toggle': `/admin/maintenance/login-slides/${params}/toggle`,
    }
    return routes[name] || '/'
}

type Slide = {
    id: number
    image_url: string
    order: number
    is_active: boolean
}

type Props = {
    slides: Slide[]
    maxSlides: number
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function LoginSlides({ slides, maxSlides, auth }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null as File | null,
    })

    const handleUpload: FormEventHandler = (e) => {
        e.preventDefault()
        
        if (!data.image) return

        post(route('admin.maintenance.login-slides.store'), {
            onSuccess: () => {
                reset()
                const fileInput = document.getElementById('image-upload') as HTMLInputElement
                if (fileInput) fileInput.value = ''
            },
        })
    }

    const handleDelete = (slideId: number) => {
        if (confirm('Are you sure you want to delete this slide?')) {
            router.delete(route('admin.maintenance.login-slides.destroy', slideId))
        }
    }

    const handleToggleActive = (slideId: number) => {
        router.post(route('admin.maintenance.login-slides.toggle', slideId))
    }

    const activeCount = slides.filter(s => s.is_active).length

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Login Slides Management" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Login Slides Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage slideshow images for the login page (Maximum {maxSlides} active slides)
                    </p>
                </div>

                {/* Upload Section */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Slide</h2>
                    
                    {activeCount >= maxSlides && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                Maximum of {maxSlides} active slides reached. Deactivate a slide to add more.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Image
                            </label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) setData('image', file)
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={processing || !data.image || activeCount >= maxSlides}
                                    className="bg-green-700 hover:bg-green-800"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {processing ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                            {errors.image && (
                                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                Supported formats: JPEG, PNG, JPG, GIF (Max 2MB)
                            </p>
                        </div>
                    </form>
                </Card>

                {/* Slides List */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Current Slides ({activeCount}/{maxSlides} active)
                        </h2>
                    </div>

                    {slides.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No slides uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload your first slide to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                                        slide.is_active 
                                            ? 'border-gray-200 bg-white' 
                                            : 'border-gray-200 bg-gray-50 opacity-60'
                                    }`}
                                >
                                    <div className="w-32 h-20 rounded overflow-hidden bg-gray-100 shrink-0">
                                        <img
                                            src={slide.image_url}
                                            alt={`Slide ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Slide {index + 1}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Order: {slide.order} • {slide.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleActive(slide.id)}
                                            disabled={!slide.is_active && activeCount >= maxSlides}
                                            title={slide.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {slide.is_active ? (
                                                <>
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-4 h-4 mr-1" />
                                                    Inactive
                                                </>
                                            )}
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(slide.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Preview Section */}
                {slides.filter(s => s.is_active).length > 0 && (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Slides Preview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {slides
                                .filter(s => s.is_active)
                                .map((slide, index) => (
                                    <div key={slide.id} className="relative">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-green-500">
                                            <img
                                                src={slide.image_url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            Slide {index + 1}
                                        </p>
                                    </div>
                                ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            These slides will appear on the login page in this order
                        </p>
                    </Card>
                )}
            </div>
        </AdminLayout>
    )
}
