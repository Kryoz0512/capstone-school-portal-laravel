<?php

namespace App\Jobs;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendAnnouncementNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $announcementId;
    public ?int $sectionId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $announcementId, ?int $sectionId = null)
    {
        $this->announcementId = $announcementId;
        $this->sectionId = $sectionId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $query = Student::select('id', 'user_id')
            ->whereNotNull('user_id');

        // If section specified, only notify students in that section
        if ($this->sectionId) {
            $query->where('current_section_id', $this->sectionId);
        }

        // Process in chunks to avoid memory issues
        $query->chunkById(500, function ($students) {
            $notifications = [];
            $now = now();

            foreach ($students as $student) {
                $notifications[] = [
                    'user_id' => $student->user_id,
                    'announcement_id' => $this->announcementId,
                    'is_read' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($notifications)) {
                DB::table('tbl_notifications')->insert($notifications);
            }
        });

        Log::info("Announcement notifications sent", [
            'announcement_id' => $this->announcementId,
            'section_id' => $this->sectionId,
        ]);
    }

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;
}
