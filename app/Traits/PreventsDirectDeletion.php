<?php

namespace App\Traits;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;

trait PreventsDirectDeletion
{
    protected bool $deletingFromCascade = false;

    public function markDeletingFromCascade(bool $value = true): static
    {
        $this->deletingFromCascade = $value;

        return $this;
    }

    protected static function bootPreventsDirectDeletion(): void
    {
        static::deleting(function (Model $model) {
            if ($model->isForceDeleting()) {
                return;
            }

            if (! $model->deletingFromCascade) {
                throw new AuthorizationException(
                    'This record cannot be deleted directly. Delete the parent record instead.'
                );
            }
        });
    }
}
