<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeocodingService
{
   
    public function geocode(string $address): ?array
    {
        $address = trim($address);
        if ($address === '') {
            return null;
        }

        // Nominatim cần User-Agent hợp lệ; không được để rỗng (dễ bị 403).
        $userAgent = trim((string) env('GEOCODING_USER_AGENT', 'smart-donate-37/1.0'));
        if ($userAgent === '') {
            $userAgent = 'smart-donate-37/1.0';
        }

        $baseUrl = trim((string) env('GEOCODING_NOMINATIM_URL', 'https://nominatim.openstreetmap.org/search'));
        if ($baseUrl === '') {
            $baseUrl = 'https://nominatim.openstreetmap.org/search';
        }

        $res = Http::withHeaders([
            'User-Agent' => $userAgent,
        ])->get($baseUrl, [
            'q' => $address,
            'format' => 'json',
            'limit' => 1,
        ]);

        if (!$res->successful()) {
            return null;
        }

        $json = $res->json();
        if (!is_array($json) || count($json) === 0) {
            return null;
        }

        $item = $json[0];
        if (!isset($item['lat'], $item['lon'])) {
            return null;
        }

        return [
            'lat' => (float)$item['lat'],
            'lng' => (float)$item['lon'],
        ];
    }
}

