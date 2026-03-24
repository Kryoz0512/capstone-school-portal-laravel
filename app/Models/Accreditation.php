<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accreditation extends Model
{
    use HasFactory;

    protected $table = 'tbl_accreditations';

    protected $fillable = [
        'accreditation_type',
        'accrediting_body',
        'certificate_number',
        'date_issued',
        'valid_from',
        'valid_until',
        'status',
        'description',
        'document_path',
    ];

    protected function casts(): array
    {
        return [
            'date_issued' => 'date',
            'valid_from' => 'date',
            'valid_until' => 'date',
        ];
    }
}
