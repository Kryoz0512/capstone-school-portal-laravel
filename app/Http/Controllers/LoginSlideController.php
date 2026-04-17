<?php

namespace App\Http\Controllers;

use App\Models\LoginSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LoginSlideController extends Controller
{
    public function index()
    {
        $slides = LoginSlide::orderBy('order')->get()->map(function ($slide) {
            return [
                'id' => $slide->id,
                'image_url' => Storage::url($slide->image_path),
                'order' => $slide->order,
                'is_active' => $slide->is_active,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/maintenance/login-slides/page', [
            'slides' => $slides,
            'maxSlides' => 5,
            'auth' => [
                'user' => \Illuminate\Support\Facades\Auth::user(),
                'admin' => $admin,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $activeCount = LoginSlide::where('is_active', true)->count();
        
        if ($activeCount >= 5) {
            return back()->withErrors(['error' => 'Maximum of 5 active slides allowed.']);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $path = $request->file('image')->store('login-slides', 'public');

        $maxOrder = LoginSlide::max('order') ?? 0;

        LoginSlide::create([
            'image_path' => $path,
            'order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return back()->with('success', 'Slide added successfully.');
    }

    public function destroy(LoginSlide $slide)
    {
        if (Storage::disk('public')->exists($slide->image_path)) {
            Storage::disk('public')->delete($slide->image_path);
        }

        $slide->delete();

        return back()->with('success', 'Slide deleted successfully.');
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'slides' => 'required|array',
            'slides.*.id' => 'required|exists:tbl_login_slides,id',
            'slides.*.order' => 'required|integer',
        ]);

        foreach ($request->slides as $slideData) {
            LoginSlide::where('id', $slideData['id'])->update(['order' => $slideData['order']]);
        }

        return back()->with('success', 'Slide order updated successfully.');
    }

    public function toggleActive(LoginSlide $slide)
    {
        if (!$slide->is_active) {
            $activeCount = LoginSlide::where('is_active', true)->count();
            if ($activeCount >= 5) {
                return back()->withErrors(['error' => 'Maximum of 5 active slides allowed.']);
            }
        }

        $slide->update(['is_active' => !$slide->is_active]);

        return back()->with('success', 'Slide status updated successfully.');
    }

    public function getActiveSlides()
    {
        $slides = LoginSlide::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($slide) {
                return Storage::url($slide->image_path);
            });

        return response()->json($slides);
    }
}
