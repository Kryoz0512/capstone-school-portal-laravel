<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $table = 'tbl_documents';

    protected $fillable = [
        'title',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'uploaded_by',
    ];

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = (int) $this->file_size;

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return $bytes . ' B';
    }

    public function getExtensionAttribute(): string
    {
        return strtoupper(pathinfo($this->file_name, PATHINFO_EXTENSION));
    }
}