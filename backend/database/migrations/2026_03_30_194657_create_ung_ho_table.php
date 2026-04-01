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
        Schema::create('ung_ho', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->unsignedBigInteger('chien_dich_gay_quy_id');
            $table->decimal('so_tien', 15, 2);
            $table->string('ma_giao_dich', 50)->nullable();
            $table->foreign('nguoi_dung_id')->references('id')->on('nguoi_dung');
            $table->foreign('chien_dich_gay_quy_id')->references('id')->on('chien_dich_gay_quy');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ung_ho');
    }
};
