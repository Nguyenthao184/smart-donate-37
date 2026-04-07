<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tin_nhan')) {
            return;
        }

        // MySQL enum alteration (keep existing values, add VIDEO).
        DB::statement("ALTER TABLE `tin_nhan` MODIFY `loai_tin` ENUM('VAN_BAN','ANH','VIDEO') NOT NULL DEFAULT 'VAN_BAN'");
    }

    public function down(): void
    {
        if (!Schema::hasTable('tin_nhan')) {
            return;
        }

        // Revert to previous enum values (drops VIDEO).
        DB::statement("ALTER TABLE `tin_nhan` MODIFY `loai_tin` ENUM('VAN_BAN','ANH') NOT NULL DEFAULT 'VAN_BAN'");
    }
};

