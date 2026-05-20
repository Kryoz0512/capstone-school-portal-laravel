import { useEffect, useMemo, useState } from 'react'

export function useClientPagination<T>(items: T[], initialPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage)

    const totalPages = Math.max(1, Math.ceil(items.length / entriesPerPage))
    const startIndex = (currentPage - 1) * entriesPerPage
    const endIndex = startIndex + entriesPerPage

    const paginatedItems = useMemo(
        () => items.slice(startIndex, endIndex),
        [items, startIndex, endIndex]
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [items.length, entriesPerPage])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const isVisibleOnScreen = (index: number) => index >= startIndex && index < endIndex

    return {
        currentPage,
        setCurrentPage,
        entriesPerPage,
        setEntriesPerPage,
        totalPages,
        paginatedItems,
        totalItems: items.length,
        startIndex,
        endIndex,
        isVisibleOnScreen,
    }
}
