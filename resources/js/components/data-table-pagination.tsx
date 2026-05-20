import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Variant = 'admin' | 'teacher'

type DataTablePaginationProps = {
    totalItems: number
    currentPage: number
    entriesPerPage: number
    totalPages: number
    onPageChange: (page: number) => void
    onEntriesPerPageChange: (entries: number) => void
    variant?: Variant
    className?: string
}

const activeButtonClass: Record<Variant, string> = {
    admin: 'bg-green-600 hover:bg-green-700',
    teacher: 'bg-blue-600 hover:bg-blue-700',
}

export function DataTablePagination({
    totalItems,
    currentPage,
    entriesPerPage,
    totalPages,
    onPageChange,
    onEntriesPerPageChange,
    variant = 'admin',
    className = '',
}: DataTablePaginationProps) {
    if (totalItems === 0) {
        return null
    }

    const start = (currentPage - 1) * entriesPerPage + 1
    const end = Math.min(currentPage * entriesPerPage, totalItems)
    const activeClass = activeButtonClass[variant]

    return (
        <div className={`p-4 border-t border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print ${className}`}>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <Select
                        value={entriesPerPage.toString()}
                        onValueChange={(value) => onEntriesPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">entries</span>
                </div>
                <p className="text-sm text-gray-600">
                    Showing {start} to {end} of {totalItems} entries
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className={currentPage === page ? activeClass : ''}
                                >
                                    {page}
                                </Button>
                            )
                        }

                        if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2">...</span>
                        }

                        return null
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export const teacherTableHeaderClass = 'bg-blue-700'
export const teacherTableHeaderCellClass = 'px-6 py-4 text-left text-base font-semibold text-white'
export const teacherTableHeaderCellCenterClass = 'px-6 py-4 text-center text-base font-semibold text-white'
