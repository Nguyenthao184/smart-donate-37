<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->id();
            $table->string('ho_ten');
            $table->string('ten_tai_khoan')->unique();
            $table->string('email')->unique();
            $table->string('mat_khau');
            $table->string('anh_dai_dien')->nullable();
            $table->enum('trang_thai',['HOAT_DONG','BI_CAM'])->default('HOAT_DONG');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nguoi_dung');
    }
};
