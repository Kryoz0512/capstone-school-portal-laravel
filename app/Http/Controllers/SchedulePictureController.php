<?php

namespace App\Http\Controllers;

use App\Models\SchedulePicture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SchedulePictureController extends Controller
{
    /**
     * Get all schedule pictures (for teacher schedule page).
     */
    public function index()
    {
        $pictures = SchedulePicture::with('uploadedBy')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($picture) {
                return [
                    'id'          => $picture->id,
                    'url'         => asset('storage/' . $picture->file_path),
                    'label'       => $picture->label,
                    'file_name'   => $picture->file_name,
                    'uploaded_by' => $picture->uploadedBy?->name,
                    'uploaded_at' => $picture->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
                ];
            });

        return response()->json(['pictures' => $pictures]);
    }

    /**
     * Upload a new schedule picture (admin only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'schedule_picture' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'label'            => ['nullable', 'string', 'max:255'],
        ]);

        $file     = $request->file('schedule_picture');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('schedule-pictures', $fileName, 'public');

        $picture = SchedulePicture::create([
            'file_path'   => $filePath,
            'file_name'   => $fileName,
            'mime_type'   => $file->getMimeType(),
            'file_size'   => $file->getSize(),
            'label'       => $request->input('label'),
            'uploaded_by' => Auth::id(),
        ]);

        return back()->with('success', 'Schedule picture uploaded successfully.');
    }

    /**
     * Delete a schedule picture (admin only).
     */
    public function destroy(SchedulePicture $schedulePicture)
    {
        Storage::disk('public')->delete($schedulePicture->file_path);
        $schedulePicture->delete();

        return back()->with('success', 'Schedule picture deleted successfully.');
    }
}