<?php
// app/Http/Controllers/DocumentController.php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    private function mapDocument(Document $document): array
    {
        return [
            'id' => $document->id,
            'title' => $document->title,
            'file_name' => $document->file_name,
            'file_type' => $document->extension,
            'file_size' => $document->formatted_size,
            'uploaded_by' => $document->uploadedBy->name ?? 'N/A',
            'uploaded_at' => $document->created_at->timezone('Asia/Manila')->format('M d, Y'),
        ];
    }

    /**
     * Shared paginated query used by both the admin and teacher views.
     */
    private function paginatedDocuments(Request $request)
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'asc'); // asc | desc by title
        $perPage = (int) $request->input('per_page', 10);

        $query = Document::with('uploadedBy');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('title', $sort === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Document $d) => $this->mapDocument($d));
    }

    /**
     * Admin view — upload, list, download, delete.
     */
    public function index(Request $request)
    {
        return Inertia::render('admin/documents/page', [
            'documents' => $this->paginatedDocuments($request),
            'filters' => $request->only(['search', 'sort', 'per_page']),
        ]);
    }

    /**
     * Teacher view — read-only list, download only.
     */
    public function teacherIndex(Request $request)
    {
        return Inertia::render('teacher/documents/page', [
            'documents' => $this->paginatedDocuments($request),
            'filters' => $request->only(['search', 'sort', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // 10MB
        ]);

        $file = $request->file('file');
        $storedName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('documents', $storedName, 'public');

        $document = Document::create([
            'title' => $validated['title'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'created',
            'description' => 'Uploaded document: ' . $document->title,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Document $document)
    {
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'deleted',
            'description' => 'Deleted document: ' . $document->title,
        ]);

        $document->delete();

        return back()->with('success', 'Document deleted successfully.');
    }

    public function download(Document $document)
    {
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}