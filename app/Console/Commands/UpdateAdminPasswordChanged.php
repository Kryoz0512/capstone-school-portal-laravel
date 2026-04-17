<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateAdminPasswordChanged extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:update-admin-password';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update existing admin users to have password_changed = true';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = DB::table('users')
            ->where('role', 'admin')
            ->update(['password_changed' => true]);

        $this->info("Updated {$count} admin user(s).");
        
        return 0;
    }
}
