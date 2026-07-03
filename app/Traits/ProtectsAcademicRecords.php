<?php

namespace App\Traits;

use Illuminate\Auth\Access\AuthorizationException;

trait ProtectsAcademicRecords
{
    protected static function bootProtectsAcademicRecords(): void
    {
        static::deleting(function () {
            throw new AuthorizationException(
                'Academic grade records are permanent and cannot be deleted.'
            );
        });
    }
}
