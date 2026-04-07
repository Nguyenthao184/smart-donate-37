<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bai_dang', function (Blueprint $table) {
            // mo_ta: allow longer descriptions
            $table->text('mo_ta')->change();

            // hinh_anh: store multiple images as JSON array of paths (e.g. ["posts/a.png","posts/b.png"])
            $table->json('hinh_anh')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('bai_dang', function (Blueprint $table) {
            $table->string('mo_ta', 255)->change();
            $table->string('hinh_anh', 255)->nullable()->change();
        });
    }
};

