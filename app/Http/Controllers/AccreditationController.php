<?php

namespace App\Http\Controllers;

use App\Models\Accreditation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccreditationController extends Controller
{
    public function index()
    {
        $accreditations = Accreditation::orderBy('created_at', 'desc')->get()->map(function ($accreditation) {
            return [
                'id' => $accreditation->id,
                'accreditation_type' => $accreditation->accreditation_type,
                'accrediting_body' => $accreditation->accrediting_body,
                'certificate_number' => $accreditation->certificate_number,
                'date_issued' => $accreditation->date_issued->format('Y-m-d'),
                'valid_from' => $accreditation->valid_from->format('Y-m-d'),
                'valid_until' => $accreditation->valid_until->format('Y-m-d'),
                'status' => $accreditation->status,
                'description' => $accreditation->description,
                'document_path' => $accreditation->document_path,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/admission/accreditation/page', [
            'accreditations' => $accreditations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'accreditation_type' => 'required|string|max:255',
            'accrediting_body' => 'required|string|max:255',
            'certificate_number' => 'required|string|max:255|unique:tbl_accreditations,certificate_number',
            'date_issued' => 'required|date',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'status' => 'required|in:Active,Expired,Pending,Suspended',
            'description' => 'nullable|string',
        ]);

        Accreditation::create($validated);

        return redirect()->back()->with('success', 'Accreditation added successfully');
    }

    public function update(Request $request, Accreditation $accreditation)
    {
        $validated = $request->validate([
            'accreditation_type' => 'required|string|max:255',
            'accrediting_body' => 'required|string|max:255',
            'certificate_number' => 'required|string|max:255|unique:tbl_accreditations,certificate_number,' . $accreditation->id,
            'date_issued' => 'required|date',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'status' => 'required|in:Active,Expired,Pending,Suspended',
            'description' => 'nullable|string',
        ]);

        $accreditation->update($validated);

        return redirect()->back()->with('success', 'Accreditation updated successfully');
    }

    public function destroy(Accreditation $accreditation)
    {
        $accreditation->delete();

        return redirect()->back()->with('success', 'Accreditation deleted successfully');
    }
}
