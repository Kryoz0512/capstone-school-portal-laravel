<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\Relation;

trait CascadesSoftDeletes
{
    /**
     * Relations that should be soft-deleted when this model is soft-deleted.
     * Override in each parent model. Never include grade or academic history relations.
     *
     * @return list<string>
     */
    protected function cascadeSoftDeleteRelations(): array
    {
        return [];
    }

    protected static function bootCascadesSoftDeletes(): void
    {
        static::deleting(function ($model) {
            if ($model->isForceDeleting()) {
                return;
            }

            $model->cascadeDeleteChildren();
        });

        static::restoring(function ($model) {
            $model->cascadeRestoreChildren();
        });
    }

    public function cascadeDeleteChildren(): void
    {
        foreach ($this->cascadeSoftDeleteRelations() as $relation) {
            if (! method_exists($this, $relation)) {
                continue;
            }

            $relationInstance = $this->{$relation}();

            if ($this->isSingleRelation($relationInstance)) {
                $child = $relationInstance->first();

                if ($child) {
                    $this->deleteCascadeChild($child);
                }

                continue;
            }

            $relationInstance->get()->each(function ($child) {
                $this->deleteCascadeChild($child);
            });
        }
    }

    public function cascadeRestoreChildren(): void
    {
        foreach ($this->cascadeSoftDeleteRelations() as $relation) {
            if (! method_exists($this, $relation)) {
                continue;
            }

            $relationInstance = $this->{$relation}();

            if ($this->isSingleRelation($relationInstance)) {
                $child = $relationInstance->onlyTrashed()->first();

                if ($child) {
                    $this->restoreCascadeChild($child);
                }

                continue;
            }

            $relationInstance->onlyTrashed()->get()->each(function ($child) {
                $this->restoreCascadeChild($child);
            });
        }
    }

    protected function deleteCascadeChild($child): void
    {
        if (method_exists($child, 'markDeletingFromCascade')) {
            $child->markDeletingFromCascade();
        }

        $child->delete();
    }

    protected function restoreCascadeChild($child): void
    {
        if (method_exists($child, 'markDeletingFromCascade')) {
            $child->markDeletingFromCascade();
        }

        $child->restore();
    }

    protected function isSingleRelation(Relation $relation): bool
    {
        return $relation instanceof \Illuminate\Database\Eloquent\Relations\HasOne
            || $relation instanceof \Illuminate\Database\Eloquent\Relations\MorphOne;
    }
}
