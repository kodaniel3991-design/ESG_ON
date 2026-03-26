"use client";

import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddButton {
  label: string;
  onClick: () => void;
}

interface CardActionBarProps {
  isEditing: boolean;
  hasSelection: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSave: () => void;
  adds?: AddButton[];
}

export function CardActionBar({
  isEditing,
  hasSelection,
  onEdit,
  onCancel,
  onDelete = undefined,
  onSave,
  adds = [],
}: CardActionBarProps) {
  return (
    <div className="flex gap-1">
      {/* 추가 버튼들 */}
      {adds.map((add) => (
        <Button
          key={add.label}
          size="sm"
          variant="outline"
          disabled={isEditing}
          onClick={add.onClick}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> {add.label}
        </Button>
      ))}

      {/* 수정 / 취소 */}
      {isEditing ? (
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="mr-1 h-3.5 w-3.5" /> 취소
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={!hasSelection} onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" /> 수정
        </Button>
      )}

      {/* 삭제 */}
      {onDelete !== undefined && (
        <Button
          size="sm"
          variant="outline"
          disabled={!hasSelection || isEditing}
          className="text-destructive hover:bg-destructive/10 disabled:text-muted-foreground"
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> 삭제
        </Button>
      )}

      {/* 저장 */}
      <Button size="sm" disabled={!isEditing} onClick={onSave}>
        <Save className="mr-1 h-3.5 w-3.5" /> 저장
      </Button>
    </div>
  );
}
