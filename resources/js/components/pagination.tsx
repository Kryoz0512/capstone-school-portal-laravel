import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

type PaginationProps = {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
    links: PaginationLink[]
    onPageChange: (url: string | null) => void
    onPerPageChange?: (perPage: number) => void
}

export function Pagination({ currentPage, lastPage, perPage, total, links, onPageChange, onPerPageChange }: PaginationProps) {
    return (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
                {/* Entries per page selector */}
                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Entries:</span>
                        <Select value={perPage.toString()} onValueChange={(value) => onPerPageChange(parseInt(value))}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Pagination controls */}
                <div className="flex items-center gap-1">
                    <Button
                        onClick={() => onPageChange(links[0]?.url)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="relative inline-flex items-center px-3 py-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {links.slice(1, -1).map((link, index) => (
                        <Button
                            key={index}
                            onClick={() => onPageChange(link.url)}
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            className={`px-3 py-2 min-w-[40px] ${link.active ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                            disabled={link.label === '...'}
                        >
                            {link.label}
                        </Button>
                    ))}
                    <Button
                        onClick={() => onPageChange(links[links.length - 1]?.url)}
                        disabled={currentPage === lastPage}
                        variant="outline"
                        size="sm"
                        className="relative inline-flex items-center px-3 py-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
