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
     * Admin view — upload, list, download, delete.
     */
    public function index()
    {
        $documents = Document::with('uploadedBy')
            ->orderBy('title')
            ->get()
            ->map(fn (Document $d) => $this->mapDocument($d));

        return Inertia::render('admin/documents/page', [
            'documents' => $documents,
        ]);
    }

    /**
     * Teacher view — read-only list, download only.
     */
    public function teacherIndex()
    {
        $documents = Document::with('uploadedBy')
            ->orderBy('title')
            ->get()
            ->map(fn (Document $d) => $this->mapDocument($d));

        return Inertia::render('teacher/documents/page', [
            'documents' => $documents,
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